/// <reference types="@angular/localize" />

import { provideHttpClient } from "@angular/common/http";
import { BrowserModule, bootstrapApplication } from "@angular/platform-browser";
import { AppRoutingModule } from "./app/app-routing.module";
import { FormsModule } from "@angular/forms";
import { AngularDraggableModule } from "angular2-draggable";
import { AppComponent } from "./app/app.component";
import {
  importProvidersFrom,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection,
} from "@angular/core";
import { DataService } from "./app/services/data.service";

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      AppRoutingModule,
      FormsModule,
      AngularDraggableModule,
    ),
    provideHttpClient(),
    provideZoneChangeDetection(),
    provideAppInitializer(() => {
      const dataService = inject(DataService);
      dataService.refreshAllData();
    }),
  ],
}).catch((err) => console.error(err));
