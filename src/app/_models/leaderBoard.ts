export interface LeaderBoard {
    username: string;
    userID: number;
    score: number;
    bonus: number;
  }

export interface LeaderBoardDTO {
  leaderboard: LeaderBoard[];
  subject?: string;
  type?: string;
}
