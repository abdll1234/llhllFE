import { Routes } from '@angular/router';
import {Upload4} from '../upload/upload4';
import {ViewFile} from '../view-file/view-file';

export const routes: Routes = [{
  path: '',
  component: Upload4,
},
  {
    path: 'view/:id',
    component: ViewFile,
  },
  {
    path: '**',
    redirectTo: ''
  }];
