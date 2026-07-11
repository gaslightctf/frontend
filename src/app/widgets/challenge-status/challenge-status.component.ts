import { DatePipe } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { NgbDropdownModule } from "@ng-bootstrap/ng-bootstrap";
import { Instance } from "src/app/api-model";
import { DataService } from "src/app/services/data.service";
import { HelperService } from "src/app/services/helper.service";

@Component({
  selector: "app-challenge-status",
  templateUrl: "./challenge-status.component.html",
  styleUrls: ["./challenge-status.component.less"],
  imports: [NgbDropdownModule, DatePipe],
})
export class ChallengeStatusComponent implements OnInit, OnDestroy {
  public instance: Instance | null = null;
  public timeRemaining: string = "";

  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    public helper: HelperService,
    private dataService: DataService,
  ) {}

  ngOnInit(): void {
    this.dataService.instance.subscribe((instance) => {
      this.instance = instance;
      this.updateTimeRemaining();
    });
    this.countdownInterval = setInterval(
      () => this.updateTimeRemaining(),
      1000,
    );
  }

  ngOnDestroy(): void {
    if (this.countdownInterval !== null) {
      clearInterval(this.countdownInterval);
    }
  }

  private updateTimeRemaining(): void {
    if (!this.instance?.timeout) {
      this.timeRemaining = "";
      return;
    }
    const msLeft = new Date(this.instance.timeout).getTime() - Date.now();
    if (msLeft <= 0) {
      this.timeRemaining = "expired";
      return;
    }
    const totalSeconds = Math.floor(msLeft / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      this.timeRemaining = `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      this.timeRemaining = `${minutes}m ${seconds}s`;
    } else {
      this.timeRemaining = `${seconds}s`;
    }
  }

  stopChallengeInstance() {
    this.dataService.stopInstance();
  }

  copyToClipboard(element: HTMLElement) {
    this.selectElementContents(element);
    navigator.clipboard
      .writeText(element.innerText)
      .then()
      .catch((e) => console.error(e));
  }

  copyToClipboardNcat(hostname: string, port: number, ssl: boolean) {
    navigator.clipboard
      .writeText(`${ssl ? "ncat --ssl" : "nc"} ${hostname} ${port}`)
      .then()
      .catch((e) => console.error(e));
  }

  copyToClipboardPwntools(hostname: string, port: number, ssl: boolean) {
    navigator.clipboard
      .writeText(`r = remote('${hostname}', ${port}${ssl ? ", ssl=True" : ""})`)
      .then()
      .catch((e) => console.error(e));
  }

  selectElementContents(element: HTMLElement) {
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
}
