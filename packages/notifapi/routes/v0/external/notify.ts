import { Router } from 'express';
import { check, validationResult } from 'express-validator';
import { getAllUserCompetitionSubscriptions } from '../../../controllers/competitionSubscription';
// import { twilioClient } from '../../../services/twilio';

const getParentActivitiyCodes = (activityCode: string): string[] => {
  if (activityCode.startsWith('other')) {
    return [];
  }

  const index = activityCode.lastIndexOf('-');
  if (index > -1) {
    const parent = activityCode.slice(0, index);
    return [parent, ...getParentActivitiyCodes(parent)];
  }

  return [];
};

const router = Router();
router.post(
  '/notify',
  check('competitionId').exists().isString(),
  check('activity').isObject(),
  check('activity.code').isString(),
  check('activity.name').isString(),
  async (req, res) => {
    console.log(28, req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { competitionId, activity } = req.body;

    const activityCodes = [
      activity.code,
      ...getParentActivitiyCodes(activity.code),
    ];

    const usersToPing = await getAllUserCompetitionSubscriptions(
      competitionId,
      activityCodes
    );

    // await twilioClient.messages.create({
    //   body: ``,
    // });

    res.json({ success: true, usersToPing });
  }
);

export default router;
