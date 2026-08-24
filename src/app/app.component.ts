import { Component, OnDestroy, OnInit } from "@angular/core";
import { DataService } from "./services/data.service";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { Subscription } from "rxjs";
import { Metadata } from "./api-model";
import { NgbDropdownModule, NgbTooltip } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.less"],
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    NgbDropdownModule,
    NgbTooltip,
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  year = new Date().getFullYear();
  theme: string | null = null;
  metadata: Metadata | null = null;

  private metadataSubscription: Subscription | null = null;

  constructor(public dataService: DataService) {}

  ngOnInit() {
    this.theme = localStorage.getItem("theme");
    this.setTheme(this.getPreferredTheme());
    this.metadataSubscription = this.dataService.metadata.subscribe(
      (metadata) => {
        this.metadata = metadata;
      },
    );
  }

  ngOnDestroy() {
    this.metadataSubscription?.unsubscribe();
  }

  getPreferredTheme() {
    if (this.theme) {
      return this.theme;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  setTheme(theme: string) {
    if (
      theme === "auto" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      document.documentElement.setAttribute("data-bs-theme", "dark");
    } else {
      document.documentElement.setAttribute("data-bs-theme", theme);
    }

    localStorage.setItem("theme", theme);
    this.theme = theme;
  }
}
