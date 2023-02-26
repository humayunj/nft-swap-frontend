import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_WS_URI;

export interface ISession {
  timestamp: number;
  xTokenId: string;
  xContractAddr: string;
  xAddr: string;
  yTokenId: string;
  yContractAddr: string;
  yAddr: string;
  xApproved: boolean;
  yApproved: boolean;
}
export function useAPI() {
  return {
    async createSession() {
      return (
        await axios.post<{ session_id: string }>(API_URL + "/create-session")
      ).data.session_id;
    },
    async getSession(sessionId: string) {
      return (await axios.get<ISession>(API_URL + "/session/" + sessionId))
        .data;
    },
  };
}
