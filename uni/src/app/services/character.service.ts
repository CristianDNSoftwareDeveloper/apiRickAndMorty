import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Character } from '../models/character.model';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  private apiUrl = 'https://rickandmortyapi.com/api/character';

  constructor(private http: HttpClient) { }

  getCharacters(name?: string, status?: string, page: number = 1): Observable<ApiResponse<Character>> {
    let params = new HttpParams().set('page', page.toString());

    if (name) {
      params = params.set('name', name);
    }
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<ApiResponse<Character>>(this.apiUrl, { params });
  }
}
