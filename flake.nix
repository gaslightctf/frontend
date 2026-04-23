{
  description = "Berg frontend";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/pull/508770/head";
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
      "https://cache.garnix.io"
    ];
    extra-trusted-public-keys = [
      "cache.nixos.org-1:6NCHdD59X431o0gWypbMrAURkbJ16ZPMQFGspcDShjY="
      "nix-community.cachix.org-1:mB9FSh9qf2dCimDSUo8Zy7bkq5CX+/rkCWyvRCYg3Fs="
      "cache.garnix.io:CTFPyKSLcx5RMJKfLo5EEPUObbA78b0YQ2DTCJXqr9g="
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
            ];
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

            bunDeps = bun2nix.fetchBunDeps { bunNix = ./bun.nix; };

            buildPhase = ''
              bun run build
            '';

            installPhase = ''
              cp -R ./dist/berg-frontend/browser/ $out
            '';
          };

          apps.deploy.program = pkgs.writeShellApplication {
            name = "deploy";

            text = ''
              export SOPS_AGE_KEY_FILE="$GARNIX_ACTION_PRIVATE_KEY_FILE"

              PROJECT_NAME=frontend-dev
              if [ "$GARNIX_BRANCH" = "prod" ]; then
                PROJECT_NAME=frontend
              fi

              sops exec-env "${./data/deploy.yaml}" \
                "wrangler pages deploy '${self'.packages.default}' --project-name '$PROJECT_NAME'"
            '';

            runtimeInputs = [
              pkgs.wrangler
              pkgs.sops
            ];
          };
        };
    };
}
