import { DatePipe, SlicePipe } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import {
  NgbHighlight,
  NgbPaginationModule,
  NgbTooltipModule,
} from "@ng-bootstrap/ng-bootstrap";
import type { EChartsCoreOption } from "echarts/core";
import type { SeriesOption } from "echarts/types/dist/shared";
import { NgxEchartsDirective } from "ngx-echarts";
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  Subscription,
} from "rxjs";
import { Metadata, PlayerAttributeValue } from "src/app/api-model";
import {
  ChallengeDetail,
  PlayerDetail,
  ScoreboardChallengeEntry,
  ScoreboardRanking,
  TeamDetail,
} from "src/app/model";
import { DataService } from "src/app/services/data.service";
import { HelperService } from "src/app/services/helper.service";

@Component({
  selector: "app-scoreboard",
  templateUrl: "./scoreboard.component.html",
  styleUrl: "./scoreboard.component.less",
  imports: [
    RouterLink,
    DatePipe,
    NgxEchartsDirective,
    SlicePipe,
    NgbTooltipModule,
    NgbPaginationModule,
    NgbHighlight,
  ],
})
export class ScoreboardComponent implements OnInit, OnDestroy {
  public echartsOptions: EChartsCoreOption = {};

  public scoreboardRanking: readonly ScoreboardRanking[] = [];
  public areTeamsEnabled = false;
  public primaryChallengeCategories: readonly string[] = [];
  public advancedView = false;
  public hoveredChallenge = "";
  public pageIndex = 1;
  public pageSize = 20;

  // Division filter. `divisionAttribute` is null when the feature is disabled,
  // in which case no filter control is shown. `selectedDivision` of null means
  // "All divisions" (global ranking).
  public divisionAttribute: string | null = null;
  public divisionValues: readonly PlayerAttributeValue[] = [];
  public selectedDivision: string | null = null;

  private scoreboardSubscription: Subscription | null = null;
  private searchTextSubscription: Subscription | null = null;
  private primaryChallengeCategoriesSubscription: Subscription | null = null;
  private areTeamsEnabledSubsciption: Subscription | null = null;
  private chartSubscription: Subscription | null = null;
  private metadataSubscription: Subscription | null = null;
  private searchText = new BehaviorSubject<string>("");
  private selectedDivision$ = new BehaviorSubject<string | null>(null);

  constructor(
    public helper: HelperService,
    private dataService: DataService,
  ) {}

  ngOnInit(): void {
    let searchTextObservable = this.searchText
      .asObservable()
      .pipe(distinctUntilChanged());
    let selectedDivisionObservable = this.selectedDivision$
      .asObservable()
      .pipe(distinctUntilChanged());
    this.scoreboardSubscription = combineLatest([
      this.dataService.getScoreboard(),
      searchTextObservable,
      selectedDivisionObservable,
    ])
      .pipe(
        map((params) => {
          const [scoreboard, searchText, division] = params;
          // Re-rank within the selected bracket so a division view shows 1..N
          // for that division, not a filtered slice of global ranks.
          let rows: readonly ScoreboardRanking[] = scoreboard;
          if (division != null) {
            rows = scoreboard
              .filter((s) => s.division === division)
              .map((s, i) => Object.freeze({ ...s, rank: i + 1 }));
          }
          var searchTextLower = searchText.toLowerCase();
          return rows.filter((s) =>
            s.name.toLowerCase().includes(searchTextLower),
          );
        }),
      )
      .subscribe((scoreboardRanking) => {
        this.scoreboardRanking = scoreboardRanking;
      });
    this.metadataSubscription = this.dataService.metadata.subscribe(
      (metadata) => {
        this.divisionAttribute = metadata.divisionAttribute;
        this.divisionValues = metadata.divisionAttribute
          ? (metadata.playerAttributes.find(
              (a) => a.name === metadata.divisionAttribute,
            )?.values ?? [])
          : [];
      },
    );
    this.primaryChallengeCategoriesSubscription = this.dataService
      .getPrimaryChallengeCategories()
      .subscribe((primaryChallengeCategories) => {
        this.primaryChallengeCategories = primaryChallengeCategories;
      });
    this.areTeamsEnabledSubsciption = this.dataService
      .areTeamsEnabled()
      .subscribe((areTeamsEnabled) => {
        this.areTeamsEnabled = areTeamsEnabled;
      });
    this.chartSubscription = combineLatest([
      this.dataService.metadata,
      this.dataService.getChallengeDetails(),
      this.dataService.getPlayerDetails(),
      this.dataService.getTeamDetails(),
      selectedDivisionObservable,
    ]).subscribe((params) => {
      const [metadata, challenges, players, teams, division] = params;
      this.updateChart(metadata, challenges, players, teams, division);
    });

    this.searchTextSubscription = searchTextObservable.subscribe((text) => {
      // Reset the page index to page 1 as soon as the search text changes.
      this.pageIndex = 1;
    });
  }

  ngOnDestroy(): void {
    this.scoreboardSubscription?.unsubscribe();
    this.searchTextSubscription?.unsubscribe();
    this.primaryChallengeCategoriesSubscription?.unsubscribe();
    this.areTeamsEnabledSubsciption?.unsubscribe();
    this.chartSubscription?.unsubscribe();
    this.metadataSubscription?.unsubscribe();
  }

  selectDivision(division: string | null) {
    this.selectedDivision = division;
    this.selectedDivision$.next(division);
    // Reset to the first page since the ranked list changes.
    this.pageIndex = 1;
  }

  divisionTitle(value: string): string {
    return this.divisionValues.find((v) => v.value === value)?.title ?? value;
  }

  toggleAdvancedView() {
    this.advancedView = !this.advancedView;
  }

  setHover(hoveredChallenge: string) {
    this.hoveredChallenge = hoveredChallenge;
  }

  searchTextChanged(searchText: string) {
    this.searchText.next(searchText);
  }

  pageSizeChanged(pageSizeValue: string) {
    this.pageSize = parseInt(pageSizeValue);
  }

  getChallengeClasses(entry: ScoreboardChallengeEntry) {
    let classes = "bi me-1";
    if (
      this.hoveredChallenge !== "" &&
      this.hoveredChallenge !== entry.challenge.name
    ) {
      classes += " other-hover ";
    }
    let primaryCategory = this.helper.getPrimaryCategory(
      entry.challenge.categories,
    );
    if (entry.solved) {
      return (
        classes +
        " " +
        this.helper.getSolvedCategoryIconClass(primaryCategory) +
        " " +
        this.helper.getDifficultyTextColorClass(entry.challenge.difficulty)
      );
    } else {
      return (
        classes +
        " " +
        this.helper.getUnsolvedCategoryIconClass(primaryCategory) +
        " unsolved"
      );
    }
  }

  toggleFullscreen(element: HTMLElement) {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      element.requestFullscreen();
    }
  }

  updateChart(
    metadata: Metadata,
    challenges: readonly ChallengeDetail[],
    players: readonly PlayerDetail[],
    teams: readonly TeamDetail[],
    division: string | null,
  ) {
    const challengePoints: { [key: string]: number } = {};
    challenges.forEach((c) => {
      challengePoints[c.challenge.name] = c.value;
    });

    // Restrict the top-10 graph to the selected bracket when a division is
    // active, so it matches the ranked table below.
    if (division != null) {
      players = players.filter((p) => p.division === division);
      teams = teams.filter((t) => t.division === division);
    }

    const scores: {
      [key: string]: {
        name: string;
        scores: [string, number][];
        totalPoints: number;
      };
    } = {};

    if (metadata.teams) {
      let teamsCopy = structuredClone(teams).filter((_) => true);
      teamsCopy.sort((a, b) => b.score - a.score);
      teamsCopy = teamsCopy.slice(0, 10);
      let solves = teamsCopy.flatMap((p) => p.solves);
      solves.sort((a, b) => a.solvedAt.getTime() - b.solvedAt.getTime());
      teamsCopy.forEach((team) => {
        scores[team.id] = { name: team.name, scores: [], totalPoints: 0 };
      });
      solves.forEach((solve) => {
        if (solve.teamId) {
          if (scores[solve.teamId]) {
            const points = challengePoints[solve.challengeName] || 0;
            scores[solve.teamId].totalPoints += points;
            scores[solve.teamId].scores.push([
              solve.solvedAt.toISOString(),
              scores[solve.teamId].totalPoints,
            ]);
          }
        }
      });
    } else {
      let playersCopy = structuredClone(players).filter((_) => true);
      playersCopy.sort((a, b) => b.score - a.score);
      playersCopy = playersCopy.slice(0, 10);
      let solves = playersCopy.flatMap((p) => p.solves);
      solves.sort((a, b) => a.solvedAt.getTime() - b.solvedAt.getTime());
      playersCopy.forEach((player) => {
        scores[player.id] = { name: player.name, scores: [], totalPoints: 0 };
      });
      solves.forEach((solve) => {
        if (scores[solve.playerId]) {
          const points = challengePoints[solve.challengeName] || 0;
          scores[solve.playerId].totalPoints += points;
          scores[solve.playerId].scores.push([
            solve.solvedAt.toISOString(),
            scores[solve.playerId].totalPoints,
          ]);
        }
      });
    }

    const echartData: SeriesOption[] = [];
    for (const score in scores) {
      echartData.push({
        type: "line",
        symbol: "none",
        lineStyle: {
          width: 1.6,
        },
        name: scores[score].name,
        data: scores[score].scores,
      });
    }

    this.echartsOptions = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
        },
      },
      legend: {
        type: "scroll",
        orient: "horizontal",
        align: "left",
        bottom: 0,
        textStyle: {
          color: "#6E7079",
        },
      },
      toolbox: {
        feature: {
          saveAsImage: {},
          dataZoom: {},
        },
      },
      grid: {
        containLabel: true,
      },
      xAxis: {
        type: "time",
      },
      yAxis: {},
      series: echartData,
    };
  }
}
