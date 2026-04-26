/// <reference types="@angular/localize" />

import {
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from "@angular/common/http";
import { authInterceptor, provideAuth } from "angular-auth-oidc-client";
import { BrowserModule, bootstrapApplication } from "@angular/platform-browser";
import { AppRoutingModule } from "./app/app-routing.module";
import { FormsModule } from "@angular/forms";
import { AngularDraggableModule } from "angular2-draggable";
import { provideEchartsCore } from "ngx-echarts";
import { AppComponent } from "./app/app.component";
import {
  importProvidersFrom,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection,
} from "@angular/core";
import { DataService } from "./app/services/data.service";
import { catchError, mergeMap, NEVER, take } from "rxjs";
import * as echarts from "echarts/core";
import { BarChart, LineChart } from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from "echarts/components";
import { CanvasRenderer, SVGRenderer } from "echarts/renderers";
import { environment } from "@env/environment";

echarts.use([
  BarChart,
  LineChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
  SVGRenderer,
]);

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      AppRoutingModule,
      FormsModule,
      AngularDraggableModule,
    ),
    provideEchartsCore({ echarts }),
    provideHttpClient(withInterceptors([authInterceptor()])),
    provideAuth({
      config: {
        configId: "berg",
        authority: environment.apiBaseUrl,
        redirectUrl: window.location.origin + "/frontend/oidc-callback",
        postLogoutRedirectUri: window.location.origin,
        clientId: "berg-client",
        scope: "openid offline_access",
        responseType: "code",
        silentRenew: true,
        useRefreshToken: true,
        ignoreNonceAfterRefresh: true,
        renewTimeBeforeTokenExpiresInSeconds: 30,
        secureRoutes: [`${environment.apiBaseUrl}/api`],
      },
    }),
    provideZoneChangeDetection(),
    provideAppInitializer(() => {
      const dataService = inject(DataService);
      dataService.loginEvents
        .pipe(
          take(1),
          mergeMap((loginResponse) => {
            if (
              !environment.metadata.allowAnonymousAccess &&
              !loginResponse.isAuthenticated
            ) {
              console.log(
                "Redirecting to authorization endpoint since anonymous access is disabled and the player is not logged in.",
              );
              dataService.login();
              return NEVER; // Stall execution since login() triggers a redirect that forces a page reload anyways.
            }

            dataService.refreshAllData();
            if (loginResponse.isAuthenticated) {
              dataService.refreshWebSocket(loginResponse.accessToken);
            } else {
              dataService.refreshWebSocket(null);
            }
            return dataService.refreshPages();
          }),
        )
        .subscribe();
    }),
  ],
}).catch((err) => console.error(err));
