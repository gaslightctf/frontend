{
  onlyBuild = [
    "packages.x86_64-linux.bunDeps"

    "checks.x86_64-linux.biome"
  ];

  dependencies = {
    "packages.x86_64-linx.deploy" = [ "packages.x86_64-linux.bunDeps" ];
    "packages.x86_64-linx.deploy-prod" = [ "packages.x86_64-linux.bunDeps" ];
  };

  deploy = {
    main = {
      package = "packages.x86_64-linux.deploy";
      branches = "default";
      secrets = [ "SOPS_AGE_KEY" ];
    };
    prod = {
      package = "packages.x86_64-linux.deploy-prod";
      branches = [ "prod" ];
      secrets = [ "SOPS_AGE_KEY" ];
    };
  };
}
