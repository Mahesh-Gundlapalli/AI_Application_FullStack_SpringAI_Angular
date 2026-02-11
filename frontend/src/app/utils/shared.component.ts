import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NgModule } from "@angular/core";

@NgModule({
  imports: [FormsModule, CommonModule],
  exports: [FormsModule, CommonModule]
})
export class SharedModule {

}
