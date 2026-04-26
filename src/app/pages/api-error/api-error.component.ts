import { Component, OnDestroy, OnInit } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { Subscription } from "rxjs";
import { DataService } from "src/app/services/data.service";
import { environment } from "@env/environment";

@Component({
  selector: "app-api-error",
  templateUrl: "./api-error.component.html",
  styleUrl: "./api-error.component.less",
  imports: [],
})
export class ApiErrorComponent implements OnInit, OnDestroy {
  public error: HttpErrorResponse | null = null;
  public retrying = false;
  private errorSubscription: Subscription | undefined;
  public readonly discordUrl = environment.discordUrl;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.errorSubscription = this.dataService.apiError.subscribe((err) => {
      this.error = err;
    });
  }

  ngOnDestroy(): void {
    this.errorSubscription?.unsubscribe();
  }

  get statusText(): string {
    if (!this.error) return "";
    if (this.error.status === 0) {
      return "Could not connect to the API server.";
    }
    return `HTTP ${this.error.status} ${this.error.statusText || ""}`.trim();
  }

  get detail(): string | null {
    if (!this.error) return null;
    if (typeof this.error.error === "string") return this.error.error;
    if (this.error.message) return this.error.message;
    return null;
  }

  retry() {
    this.retrying = true;
    this.dataService.clearApiError();
    window.location.reload();
  }
}
