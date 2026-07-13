{
  description = "Berg frontend";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";

    devshell.url = "github:numtide/devshell";
    devshell.inputs.nixpkgs.follows = "nixpkgs";

    bun2nix.url = "github:nix-community/bun2nix";
    bun2nix.inputs.nixpkgs.follows = "nixpkgs";
  };

  nixConfig = {
    extra-substituters = [
      "https://cache.nixos.org"
      "https://nix-community.cachix.org"
      "https://cache.nix-ci.com"
    ];
    extra-trusted-public-keys = [
      "cache.nixos.org-1:6NCHdD59X431o0gWypbMrAURkbJ16ZPMQFGspcDShjY="
      "nix-community.cachix.org-1:mB9FSh9qf2dCimDSUo8Zy7bkq5CX+/rkCWyvRCYg3Fs="
      "nix-ci:g3xV5BDTLtIBZr/A00IU1x0EtKKlb7YLgBN2SgYgM6A="
    ];
  };

  outputs =
    inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
      ];

      imports = [
        inputs.devshell.flakeModule
      ];

      perSystem =
        {
          pkgs,
          inputs',
          self',
          lib,
          ...
        }:
        let
          bun2nix = inputs'.bun2nix.packages.default;
        in
        {
          devshells.default = {
            commands = [
              {
                package = pkgs.bun;
                category = "bun";
              }
              {
                package = bun2nix;
                category = "bun";
              }

              {
                package = pkgs.wrangler;
                category = "deploy";
              }
              {

                package = pkgs.sops;
                category = "secrets";
              }
              {
                package = pkgs.age;
                category = "secrets";
              }

              {
                package = pkgs.biome;
                category = "format";
              }
            ];
          };

          packages.bunDeps = bun2nix.fetchBunDeps {
            bunNix = builtins.path {
              path = ./bun.nix;
              name = "bun.nix";
            };
          };

          packages.default = bun2nix.mkDerivation {
            pname = "berg-frontend";
            version = "1.0.0";

            src = lib.cleanSourceWith {
              filter = (
                name: type:
                type != "regular"
                || !(builtins.elem (baseNameOf name) [
                  "Dockerfile"
                  "nginx.conf"

                  "garnix.yaml"
                  "flake.nix"
                  "flake.lock"

                  "README.md"
                  "LICENSE"

                  ".envrc"
                  ".gitattributes"
                  ".gitignore"
                  ".sops.yaml"
                  "deploy.yaml"
                ])
              );
              src = lib.cleanSourceWith {
                filter = lib.cleanSourceFilter;
                src = ./.;
              };
            };

            nativeBuildInputs = [
              bun2nix.hook
            ];

            inherit (self'.packages) bunDeps;

            buildPhase = ''
              bun run build
            '';

            installPhase = ''
              cp -R ./dist/berg-frontend/browser/ $out
            '';
          };
          packages.prod = self'.packages.default.overrideAttrs {
            pname = "berg-frontend-prod";
            buildPhase = ''
              bun run build:prod
            '';
          };

          packages.deploy = pkgs.writeShellApplication {
            name = "deploy";

            text = ''
              sops exec-env "${./data/deploy.yaml}" \
                "wrangler pages deploy '${self'.packages.default}' --project-name 'frontend-dev'"
            '';

            runtimeInputs = [
              pkgs.wrangler
              pkgs.sops
            ];
          };
          packages.deploy-prod = pkgs.writeShellApplication {
            name = "deploy";

            text = ''
              sops exec-env "${./data/deploy.yaml}" \
                "wrangler pages deploy '${self'.packages.prod}' --project-name 'frontend'"
            '';

            runtimeInputs = [
              pkgs.wrangler
              pkgs.sops
            ];
          };

          checks.biome = pkgs.writeShellApplication {
            name = "biome";

            text = ''
              biome format
            '';

            runtimeInputs = [
              pkgs.biome
            ];
          };
        };
    };
}
