import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { DataService } from "src/app/services/data.service";
import { combineLatest, map, Subscription } from "rxjs";
import { HelperService } from "src/app/services/helper.service";
import { DatePipe, KeyValuePipe } from "@angular/common";
import { TeamDetail } from "src/app/model";
import { Metadata, Player } from "src/app/api-model";

@Component({
  selector: "app-team",
  templateUrl: "./team-detail.component.html",
  styleUrls: ["./team-detail.component.less"],
  imports: [RouterLink, DatePipe, KeyValuePipe],
})
export class TeamDetailComponent implements OnInit, OnDestroy {
  private detailSubscription: Subscription | null = null;
  private areTeamsEnabledSubscription: Subscription | null = null;

  teamDetail: TeamDetail | null = null;
  areTeamsEnabled = false;
  metadata: Metadata | null = null;
  overallRank: number | null = null;
  divisionRank: number | null = null;
  // True when members don't all share the same division, so the team falls back
  // to the default division — surfaced as a warning for team leaders.
  membersMismatch = false;

  constructor(
    public dataService: DataService,
    public helper: HelperService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    let teamId = this.route.params.pipe(map((params) => params["uuid"]));
    this.detailSubscription = combineLatest([
      teamId,
      this.dataService.getTeamDetails(),
      this.dataService.metadata,
    ]).subscribe((params) => {
      const [id, teams, metadata] = params;
      this.metadata = metadata;
      const ranked = [...teams].sort((a, b) => this.compare(a, b));
      const team = ranked.find((t) => t.id === id) ?? null;
      this.teamDetail = team;
      if (team == null) {
        this.overallRank = null;
        this.divisionRank = null;
        this.membersMismatch = false;
        return;
      }
      this.overallRank = ranked.findIndex((t) => t.id === id) + 1;
      if (metadata.divisionAttribute && team.division != null) {
        const inDivision = ranked.filter((t) => t.division === team.division);
        this.divisionRank = inDivision.findIndex((t) => t.id === id) + 1;
      } else {
        this.divisionRank = null;
      }
      this.membersMismatch = this.computeMismatch(team, metadata);
    });
    this.areTeamsEnabledSubscription = this.dataService
      .areTeamsEnabled()
      .subscribe((areTeamsEnabled) => {
        this.areTeamsEnabled = areTeamsEnabled;
      });
  }

  ngOnDestroy(): void {
    this.detailSubscription?.unsubscribe();
    this.areTeamsEnabledSubscription?.unsubscribe();
  }

  private compare(a: TeamDetail, b: TeamDetail): number {
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

  private computeMismatch(team: TeamDetail, metadata: Metadata): boolean {
    if (!metadata.divisionAttribute || team.players.length === 0) return false;
    const first = this.rawDivision(team.players[0]);
    return team.players.some((p) => this.rawDivision(p) !== first);
  }

  private rawDivision(player: Player): string | null {
    if (!this.metadata?.divisionAttribute) return null;
    return player.attributes[this.metadata.divisionAttribute] ?? null;
  }

  get hasDivisions(): boolean {
    return !!this.metadata?.divisionAttribute;
  }

  divisionLabel(value: string | null): string {
    if (!value || !this.metadata?.divisionAttribute) return "—";
    return (
      this.metadata.playerAttributes
        .find((a) => a.name === this.metadata!.divisionAttribute)
        ?.values.find((v) => v.value === value)?.title ?? value
    );
  }

  memberDivisionLabel(player: Player): string {
    return this.divisionLabel(this.rawDivision(player));
  }
}
