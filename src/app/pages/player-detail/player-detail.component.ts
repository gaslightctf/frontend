import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { DataService } from "src/app/services/data.service";
import { HelperService } from "src/app/services/helper.service";
import { combineLatest, map, Subscription } from "rxjs";
import { PlayerDetail } from "src/app/model";
import { DatePipe, KeyValuePipe } from "@angular/common";
import { Metadata, PlayerAttributeValue } from "src/app/api-model";

@Component({
  selector: "app-player",
  templateUrl: "./player-detail.component.html",
  styleUrls: ["./player-detail.component.less"],
  imports: [RouterLink, DatePipe, KeyValuePipe],
})
export class PlayerDetailComponent implements OnInit, OnDestroy {
  private detailSubscription: Subscription | null = null;
  private areTeamsEnabledSubscription: Subscription | null = null;
  private isAdminSubscription: Subscription | null = null;

  playerDetail: PlayerDetail | null = null;
  areTeamsEnabled = false;
  metadata: Metadata | null = null;
  overallRank: number | null = null;
  divisionRank: number | null = null;
  isAdmin = false;

  constructor(
    public dataService: DataService,
    public helper: HelperService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    let playerId = this.route.params.pipe(map((params) => params["uuid"]));
    this.detailSubscription = combineLatest([
      playerId,
      this.dataService.getPlayerDetails(),
      this.dataService.metadata,
    ]).subscribe((params) => {
      const [id, players, metadata] = params;
      this.metadata = metadata;
      // Rank entries the same way the scoreboard does (score, then earliest last
      // solve, then name) so the numbers agree.
      const ranked = [...players].sort((a, b) => this.compare(a, b));
      const player = ranked.find((p) => p.id === id) ?? null;
      this.playerDetail = player;
      if (player == null) {
        this.overallRank = null;
        this.divisionRank = null;
        return;
      }
      this.overallRank = ranked.findIndex((p) => p.id === id) + 1;
      if (metadata.divisionAttribute && player.division != null) {
        const inDivision = ranked.filter((p) => p.division === player.division);
        this.divisionRank = inDivision.findIndex((p) => p.id === id) + 1;
      } else {
        this.divisionRank = null;
      }
    });
    this.areTeamsEnabledSubscription = this.dataService
      .areTeamsEnabled()
      .subscribe((areTeamsEnabled) => {
        this.areTeamsEnabled = areTeamsEnabled;
      });
    this.isAdminSubscription = this.dataService.isAdmin.subscribe((isAdmin) => {
      this.isAdmin = isAdmin;
    });
  }

  ngOnDestroy(): void {
    this.detailSubscription?.unsubscribe();
    this.areTeamsEnabledSubscription?.unsubscribe();
    this.isAdminSubscription?.unsubscribe();
  }

  private compare(a: PlayerDetail, b: PlayerDetail): number {
    const scoreDiff = b.score - a.score;
    if (scoreDiff !== 0) return scoreDiff;
    const now = Date.now();
    const aLast = a.solves.length
      ? Math.max(...a.solves.map((s) => s.solvedAt.getTime()))
      : now;
    const bLast = b.solves.length
      ? Math.max(...b.solves.map((s) => s.solvedAt.getTime()))
      : now;
    if (aLast !== bLast) return aLast - bLast;
    return a.name.localeCompare(b.name);
  }

  get divisionValues(): readonly PlayerAttributeValue[] {
    if (!this.metadata?.divisionAttribute) return [];
    return (
      this.metadata.playerAttributes.find(
        (a) => a.name === this.metadata!.divisionAttribute,
      )?.values ?? []
    );
  }

  get hasDivisions(): boolean {
    return !!this.metadata?.divisionAttribute;
  }

  divisionLabel(value: string | null): string {
    if (!value || !this.metadata?.divisionAttribute) return "—";
    return this.getAttributeValueTitle(this.metadata.divisionAttribute, value);
  }

  getAttributeTitle(name: string) {
    return (
      this.metadata?.playerAttributes.find((a) => a.name == name)?.title ?? name
    );
  }

  getAttributeValueTitle(name: string, value: string) {
    return (
      this.metadata?.playerAttributes
        .find((a) => a.name == name)
        ?.values.find((v) => v.value == value)?.title ?? value
    );
  }

  adminSetDivision(value: string) {
    if (!this.playerDetail || !this.metadata?.divisionAttribute) return;
    this.dataService
      .adminSetPlayerAttributes(this.playerDetail.id, {
        [this.metadata.divisionAttribute]: value,
      })
      .subscribe();
  }

  hasAttributes() {
    if (this.playerDetail) {
      if (Object.keys(this.playerDetail.attributes).length > 0) {
        return true;
      }
    }
    return false;
  }
}
