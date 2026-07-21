{
  description = "Berg frontend";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";

    devshell.url = "github:numtide/devshell";
    devshell.inputs.nixpkgs.follows = "nixpkgs";
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
        { pkgs, ... }:
        {
          devshells.default = {
            commands = [
              {
                package = pkgs.bun;
                category = "bun";
              }

              {
                package = pkgs.biome;
                category = "format";
              }
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
