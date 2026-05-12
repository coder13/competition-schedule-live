import { Competition } from '@wca/helpers';
import {
  RESTDataSource,
  WillSendRequestOptions,
} from '@apollo/datasource-rest';
import { isMocksMode } from '../../mocks/config';
import { getMockCompetition } from '../../mocks/wca';

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
    if (isMocksMode()) {
      return getMockCompetition().schedule;
    }

    return this.get(`competitions/${competitionId}/schedule`);
  }

  async getWcif(competitionId: string): Promise<Competition> {
    if (isMocksMode()) {
      return getMockCompetition();
    }

    return this.get(`competitions/${competitionId}/wcif`);
  }
}

export default WcaApi;
