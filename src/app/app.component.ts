import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EmpAddEditComponent } from './emp-add-edit/emp-add-edit.component';
import { EmployeeService } from './services/employee.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CoreService } from './core/core.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'firstName',
    'lastName',
    'email',
    'dob',
    'gender',
    'education',
    'company',
    'experience',
    'package',
    'action',
  ];
  dataSource!: MatTableDataSource<any>;
historyLog: string[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private _dialog: MatDialog,
    private _empService: EmployeeService,
    private _coreService: CoreService
  ) {}

  ngOnInit(): void {
    this.getEmployeeList();
  }

  openAddEditEmpForm() {
    const dialogRef = this._dialog.open(EmpAddEditComponent);
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.getEmployeeList();
        }
      },
    });
    this.addToHistoryLog('Opened Add/Edit Form');
  }

  getEmployeeList() {
    this._empService.getEmployeeList().subscribe({
      next: (res) => {
        this.dataSource = new MatTableDataSource(res);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      },
      error: console.log,
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteEmployee(id: number) {
    this._empService.deleteEmployee(id).subscribe({
      next: (res) => {
        this._coreService.openSnackBar('Employee deleted!', 'done');
        this.getEmployeeList();
          this.addToHistoryLog('Deleted Employee with ID: ' + id);
      },
      error: console.log,
    });
  }

  openEditForm(data: any) {
    const dialogRef = this._dialog.open(EmpAddEditComponent, {
      data,
    });

    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.getEmployeeList();
        }
      },
    });
  }

  addToHistoryLog(action: string) {
    const timestamp = new Date().toLocaleString();
    const logEntry = `${timestamp}: ${action}`;
    this.historyLog.push(logEntry);
  
    // Display a snackbar notification for the added log entry
    this._snackBar.open(logEntry, 'Dismiss', {
      duration: 3000, // Duration in milliseconds (3 seconds in this example)
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
  openHistoryLogDialog() {
    const historyLogString = this.historyLog.join('\n');
    alert('History Log:\n' + historyLogString);
  }
  exportToCsv() {
    // Prepare CSV content
    let csvContent = '';
    
    // Add header row to CSV content
    csvContent += this.displayedColumns.join(',') + '\r\n';
  
    // Add data rows to CSV content
    this.dataSource.data.forEach((row) => {
      const rowData = this.displayedColumns.map((column) => row[column]);
      const rowString = rowData.join(',');
      csvContent += rowString + '\r\n';
    });
  
    // Convert CSV content to Blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
    // Create a temporary URL for the Blob
    const url = URL.createObjectURL(blob);
  
    // Create a temporary anchor tag for download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employees.csv';
  
    // Trigger the download
    document.body.appendChild(a);
    a.click();
  
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
