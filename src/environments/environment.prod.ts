export const environment = {
  production: true,
  apiBaseUrl: "https://api.gaslightctf.cooking",
  wsEventsUrl: "wss://api.gaslightctf.cooking/api/events",
  metadata: {
    version: "5.13.4",
    eventName: "gaslightCTF 2026",
    eventOrganiser: "gaslightCTF",
    eventLogoUrl: "https://gaslightctf.cooking/assets/gaslighticoncolor.png",
    start: "2026-04-25T22:22:30Z",
    end: "2026-08-17T12:00:00Z",
    allowAnonymousAccess: true,
    playerAttributes: [
      {
        name: "division",
        title: "Division",
        description:
          "Select your prize division. Please reach out with any questions regarding eligibility!",
        public: true,
        required: true,
        values: [
          {
            value: "secondary",
            title: "Secondary School",
            description:
              "Pre-university students, e.g. secondary school, high school",
          },
          {
            value: "uni",
            title: "University",
            description: "Higher education students, e.g. university, college",
          },
          {
            value: "open",
            title: "Open",
            description: "Anybody!",
          },
        ],
      },
    ],
    freezeStart: "2099-01-01T00:00:00+00:00",
    freezeEnd: "2099-01-01T00:00:00+00:00",
    teams: true,
    challengeMaximumValue: 500,
    challengeMinimumValue: 100,
    challengeSolvesBeforeMinimum: 50,
  },
};
