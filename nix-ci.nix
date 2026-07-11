{
  onlyBuild = [
    "checks.x86_64-linux.biome"
  ];

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
