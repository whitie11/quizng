import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';;
import { Question, QuestionBank, questionGroupList } from '../_models/question';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  apiRoot = environment.apiRoot;

  constructor(private http: HttpClient) { }
 // .post(this.apiRoot.concat('user/register/'), regDTO);
  public getAllQuestions(){
    return this.http.get(this.apiRoot.concat('quizAdmin/questions/'))
  }

  public getQuestionGroup(group: string){
    return this.http.post<QuestionBank[]>(this.apiRoot.concat('quizAdmin/questions/'),{group: group})
  }

  public saveQuestion(question: QuestionBank){
    return this.http.put(this.apiRoot.concat('quizAdmin/questions/'),question)
  }
  
  public getQuestionGroupNames(){
    return this.http.get<questionGroupList[]>(this.apiRoot.concat('quizAdmin/questions/groups/'))
  }


}
