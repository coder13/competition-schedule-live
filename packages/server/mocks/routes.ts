import { Router } from 'express';
import {
  getMockCompetition,
  getMockCompetitionSearchResult,
} from './wca';
import { MOCK_COMPETITION_ID } from './config';

const router = Router();

router.get('/api/v0/me', (_, res) => {
  res.json({
    me: {
      id: 8184,
      name: 'Mock Delegate',
      wca_id: '2026MOCK01',
      country_iso2: 'US',
      email: 'mock@example.com',
      avatar: {
        url: '',
        pending_url: '',
        thumb_url: '',
      },
    },
  });
});

router.get('/api/v0/competitions', (_, res) => {
  res.json(getMockCompetitionSearchResult());
});

router.get('/api/v0/competitions/:competitionId/wcif', (req, res) => {
  if (req.params.competitionId !== MOCK_COMPETITION_ID) {
    res.status(404).json({ error: 'Mock competition not found' });
    return;
  }

  res.json(getMockCompetition());
});

router.get('/api/v0/competitions/:competitionId/wcif/public', (req, res) => {
  if (req.params.competitionId !== MOCK_COMPETITION_ID) {
    res.status(404).json({ error: 'Mock competition not found' });
    return;
  }

  res.json(getMockCompetition());
});

router.get('/api/v0/competitions/:competitionId/schedule', (req, res) => {
  if (req.params.competitionId !== MOCK_COMPETITION_ID) {
    res.status(404).json({ error: 'Mock competition not found' });
    return;
  }

  res.json(getMockCompetition().schedule);
});

export default router;
