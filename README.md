# frontend

gaslightCTF's [Berg](https://berg.norelect.ch/) frontend. Forked on 2026-04-23 from upstream commit [3bc8775](https://github.com/BergCTF/platform/tree/3bc8775ab874c0780329854f42be50f162eb090c/frontend)

## Changes from upstream

Heavily vibecoded (not an Angular dev).

- [x] deploying as static files instead of nginx
    - [x] lazy loading scoreboard chart dependencies
- [x] bundling metadata to prevent FOUC
- [x] error page on API failure
- [x] replacing dynamic pages system with static pages instead
