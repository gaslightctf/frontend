{
  description = "Berg frontend";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
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
    ];
    extra-trusted-public-keys = [
      "cache.nixos.org-1:6NCHdD59X431o0gWypbMrAURkbJ16ZPMQFGspcDShjY="
      "nix-community.cachix.org-1:mB9FSh9qf2dCimDSUo8Zy7bkq5CX+/rkCWyvRCYg3Fs="
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
        { pkgs, inputs', ... }:
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
            ];
          };

          packages.default = bun2nix.mkDerivation {
            pname = "berg-frontend";
            version = "1.0.0";

            src = ./.;

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
        };
    };
}
