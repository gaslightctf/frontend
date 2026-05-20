import { Component, Input, OnInit, OnDestroy } from "@angular/core";
import { interval, Subscription } from "rxjs";
import { DatePipe } from "@angular/common";
import { NgbTooltip } from "@ng-bootstrap/ng-bootstrap";
import { HelperService } from "src/app/services/helper.service";

@Component({
  selector: "app-countdown",
  templateUrl: "./countdown.component.html",
  imports: [NgbTooltip, DatePipe],
})
export class CountdownComponent implements OnInit, OnDestroy {
  @Input() target!: Date;
  @Input() label = "Starts in:";

  public countdownText = "";
  private timerSub: Subscription | null = null;

  constructor(private helper: HelperService) {}

  ngOnInit(): void {
    this.update();
    this.timerSub = interval(1000).subscribe(() => this.update());
  }

  ngOnDestroy(): void {
    this.timerSub?.unsubscribe();
  }

  private update(): void {
    this.countdownText = this.helper.getCountdownText(this.target, null);
  }
}
