import { inject, NgModule } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterModule,
  Routes,
} from "@angular/router";
import { ChallengesComponent } from "./pages/challenges/challenges.component";
import { ProfileSettingsComponent } from "./pages/profile-settings/profile-settings.component";
import { PlayerDetailComponent } from "./pages/player-detail/player-detail.component";
import { ChallengeDetailComponent } from "./pages/challenge-detail/challenge-detail.component";
import { HomeComponent } from "./pages/home/home.component";
import { TeamDetailComponent } from "./pages/team-detail/team-detail.component";
import { TeamComponent } from "./pages/team/team.component";
import { provideEchartsCore } from "ngx-echarts";
import { ActivityComponent } from "./pages/activity/activity.component";
import { combineLatest, map, Observable, of, take } from "rxjs";
import { DataService } from "./services/data.service";
import { playerAttributeGuard } from "./guards/player-attribute.guard";
import { PlayerAttributesComponent } from "./pages/player-attributes/player-attributes.component";
import { ApiErrorComponent } from "./pages/api-error/api-error.component";

const challengeTitleResolver: ResolveFn<string> = (
  route: ActivatedRouteSnapshot,
): Observable<string> => {
  const name = route.paramMap.get("name");
  const dataService = inject(DataService);
  return combineLatest([
    dataService.metadata,
    dataService.getChallengeDetail(of(name)),
  ]).pipe(
    take(1),
    map((params) => {
      const [metadata, challenge] = params;
      if (challenge) {
        return `${challenge.challenge.displayName || challenge.challenge.name} | ${metadata.eventName}`;
      }
      return `Challenge Not Found | ${metadata.eventName}`;
    }),
  );
};

const playerTitleResolver: ResolveFn<string> = (
  route: ActivatedRouteSnapshot,
): Observable<string> => {
  const id = route.paramMap.get("uuid");
  const dataService = inject(DataService);
  return combineLatest([
    dataService.metadata,
    dataService.getPlayerDetail(of(id)),
  ]).pipe(
    take(1),
    map((params) => {
      const [metadata, player] = params;
      if (player) {
        return `${player.name} | ${metadata.eventName}`;
      }
      return `Player Not Found | ${metadata.eventName}`;
    }),
  );
};

const teamTitleResolver: ResolveFn<string> = (
  route: ActivatedRouteSnapshot,
): Observable<string> => {
  const id = route.paramMap.get("uuid");
  const dataService = inject(DataService);
  return combineLatest([
    dataService.metadata,
    dataService.getTeamDetail(of(id)),
  ]).pipe(
    take(1),
    map((params) => {
      const [metadata, team] = params;
      if (team) {
        return `${team.name} | ${metadata.eventName}`;
      }
      return `Team Not Found | ${metadata.eventName}`;
    }),
  );
};

function prefixedTitleResolver(title: string): ResolveFn<string> {
  return (route: ActivatedRouteSnapshot): Observable<string> => {
    const dataService = inject(DataService);
    return dataService.metadata.pipe(
      take(1),
      map((metadata) => {
        return `${title} | ${metadata.eventName}`;
      }),
    );
  };
}

const routes: Routes = [
  {
    path: "",
    component: HomeComponent,
    title: prefixedTitleResolver("Home"),
    canActivate: [playerAttributeGuard],
    runGuardsAndResolvers: "always",
    pathMatch: "full",
  },
  {
    path: "challenges",
    component: ChallengesComponent,
    title: prefixedTitleResolver("Challenges"),
    canActivate: [playerAttributeGuard],
    runGuardsAndResolvers: "always",
  },
  {
    path: "challenges/:name",
    component: ChallengeDetailComponent,
    title: challengeTitleResolver,
    canActivate: [playerAttributeGuard],
    runGuardsAndResolvers: "always",
  },
  {
    path: "profile-settings",
    component: ProfileSettingsComponent,
    title: prefixedTitleResolver("Profile Settings"),
    canActivate: [playerAttributeGuard],
    runGuardsAndResolvers: "always",
  },
  {
    path: "player-attributes",
    component: PlayerAttributesComponent,
    title: prefixedTitleResolver("Player Attributes"),
    canActivate: [],
    runGuardsAndResolvers: "always",
  },
  {
    path: "players/:uuid",
    component: PlayerDetailComponent,
    title: playerTitleResolver,
    canActivate: [playerAttributeGuard],
    runGuardsAndResolvers: "always",
  },
  {
    path: "player/:uuid",
    component: PlayerDetailComponent,
    title: playerTitleResolver,
    canActivate: [playerAttributeGuard],
    runGuardsAndResolvers: "always",
  },
  {
    path: "teams/:uuid",
    component: TeamDetailComponent,
    title: teamTitleResolver,
    canActivate: [playerAttributeGuard],
    runGuardsAndResolvers: "always",
  },
  {
    path: "team/:uuid",
    component: TeamDetailComponent,
    title: teamTitleResolver,
    canActivate: [playerAttributeGuard],
    runGuardsAndResolvers: "always",
  },
  {
    path: "team",
    component: TeamComponent,
    title: prefixedTitleResolver("Team Settings"),
    canActivate: [playerAttributeGuard],
    runGuardsAndResolvers: "always",
  },
  {
    path: "activity",
    component: ActivityComponent,
    title: prefixedTitleResolver("Activity"),
    canActivate: [playerAttributeGuard],
    runGuardsAndResolvers: "always",
  },
  {
    path: "scoreboard",
    loadComponent: () =>
      import("./pages/scoreboard").then((m) => m.ScoreboardComponent),
    providers: [
      provideEchartsCore({
        echarts: import("./pages/scoreboard").then((m) => m.echarts),
      }),
    ],
    title: prefixedTitleResolver("Scoreboard"),
    canActivate: [playerAttributeGuard],
    runGuardsAndResolvers: "always",
  },
  {
    path: "api-error",
    component: ApiErrorComponent,
    title: prefixedTitleResolver("API Unavailable"),
  },
  {
    path: "**",
    redirectTo: "",
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: "reload" })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
