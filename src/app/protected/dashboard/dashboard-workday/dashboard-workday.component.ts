import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { Workday } from 'src/app/shared/models/workday';
import { fromEvent, Subject, timer, interval, Observable } from 'rxjs';
import { tap, takeUntil, map } from 'rxjs/operators';
import { Task } from 'src/app/shared/models/task';

@Component({
  selector: 'al-dashboard-workday',
  templateUrl: './dashboard-workday.component.html',
  styleUrls: ['./dashboard-workday.component.scss']
})
export class DashboardWorkdayComponent implements OnInit {

  @Input() workday: Workday;
  isPomodoroActive: boolean;
  startPomodoro$: Subject<string>;
  cancelPomodoro$: Subject<string>;
  completePomodoro$: Subject<string>;
  currentProgress: number;
  maxProgress: number;
  pomodoro$: Observable<number>;
  currentTask: Task;

  constructor() { }

  ngOnInit(): void {
    this.isPomodoroActive = false;
    this.startPomodoro$ = new Subject();
    this.cancelPomodoro$ = new Subject();
    this.completePomodoro$ = new Subject();
    this.currentProgress = 0
    this.maxProgress = 5;
    this.pomodoro$ = interval(1000).pipe(
      takeUntil(timer(6000)),
      map(x => x + 1)
    );
  }

  startPomodoro() {
    this.startPomodoro$.next('start');
    this.isPomodoroActive = true;
    this.pomodoro$.pipe(
      takeUntil(this.cancelPomodoro$),
      takeUntil(this.completePomodoro$),
    ).subscribe({
      next: currentProgress => this.currentProgress = currentProgress,
      complete: () => this.completePomodoro()
    });
  }

  cancelPomodoro() {
    this.cancelPomodoro$.next('cancel');
    this.isPomodoroActive = false;
  }

  completePomodoro() {
    this.completePomodoro$.next('complete');
    this.isPomodoroActive = false;
    console.log("pomodoro complete !");
    // Ajouter un done à la tâche en cours.
    // 👉 Il me faut la tâche courante
    this.currentTask = this.getCurrentTask();
    // 👉 Mettre à jour cette tâche avec done + 1, en local + Firestore.
    // 👉 Si tous les done sont terminés, alors marquer la tâche commme complete.
    // 👉 Si toutes les tâches sont complete, alors marquer la journée comme terminé.
  }

  getCurrentTask(): Task {
    return this.workday.tasks.find(task => task.todo > task.done)
  }

}
