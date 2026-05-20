import { Component, OnInit, OnDestroy } from "@angular/core";
import { DataService } from "src/app/services/data.service";
import { CountdownComponent } from "src/app/widgets/countdown/countdown.component";
import { Subscription } from "rxjs";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  imports: [CountdownComponent],
})
export class HomeComponent implements OnInit, OnDestroy {
  public ctfStart: Date | null = null;
  public ctfEnd: Date | null = null;
  public hasCTFStarted = false;
  public hasCTFEnded = false;

  private subs: Subscription[] = [];

  constructor(public dataService: DataService) {}

  ngOnInit(): void {
    this.subs.push(
      this.dataService.getCTFStart().subscribe((d) => (this.ctfStart = d)),
      this.dataService.getCTFEnd().subscribe((d) => (this.ctfEnd = d)),
      this.dataService.hasCTFStarted.subscribe((v) => (this.hasCTFStarted = v)),
      this.dataService.hasCTFEnded.subscribe((v) => (this.hasCTFEnded = v)),
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
