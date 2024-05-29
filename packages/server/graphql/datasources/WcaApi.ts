import { Competition } from '@wca/helpers';
import {
  RESTDataSource,
  WillSendRequestOptions,
} from '@apollo/datasource-rest';

class WcaApi extends RESTDataSource {
  accessToken?: string;

  constructor(origin: string, accessToken?: string) {
    super();
    this.baseURL = origin + '/api/v0/';
    this.accessToken = accessToken;
  }

  override willSendRequest(request: WillSendRequestOptions) {
    if (this.accessToken) {
      request.headers.authorization = `Bearer ${this.accessToken}`;
    }
  }

  async getSchedule(competitionId: string): Promise<Competition['schedule']> {
    return this.get(`competitions/${competitionId}/schedule`);
  }

  async getWcif(competitionId: string): Promise<Competition> {
    return this.get(`competitions/${competitionId}/wcif`);
  }
}

export default WcaApi;
