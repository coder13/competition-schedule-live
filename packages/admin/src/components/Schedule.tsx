import { formatTimeRange } from '@notifycomp/frontend-common/lib';
import { useParams } from 'react-router-dom';
import classNames from 'classnames';
import useActivities from '../hooks/useActivities';
import { Button } from './Tailwind';
import { useMutation } from '@apollo/client';
import { ResetActivitiesMutation } from '../graphql';

function CompetitionSchedule() {
  const { competitionId } = useParams();

  const { venues, activities } = useActivities(competitionId);

  const [resetActivities] = useMutation(ResetActivitiesMutation, {
    refetchQueries: ['CompetitionActivities'],
    variables: {
      competitionId,
    },
    onCompleted: () => {
      console.log('reset activities');
    },
    onError: (err) => {
      console.error(err);
    },
  });

  const handleResetActivities = () => {
    resetActivities();
  };

  return (
    <div className="border border-gray-200 p-2 space-y-2">
      <span className="text-lg">Schedule</span>
      <hr />
      <div className="flex justify-end">
        <Button className="bg-red-500" onClick={handleResetActivities}>
          Reset Activities
        </Button>
      </div>
      <div className="flex flex-col">
        {venues?.map((venue) => (
          <div key={venue.id} className="flex flex-col">
            <span className="text-sm">{venue.name}</span>
            <div className="flex space-x-8">
              {venue.rooms.map((room) => (
                <div key={room.id} className="flex flex-1 flex-col">
                  <b className="p-2">{room.name}</b>
                  <div className="flex flex-col">
                    {room.activities
                      .flatMap((ra) =>
                        ra?.childActivities?.length ? ra.childActivities : ra
                      )
                      .sort(
                        (a, b) =>
                          new Date(a.startTime).getTime() -
                          new Date(b.startTime).getTime()
                      )
                      .map((activity) => {
                        const liveActivityData = activities.find(
                          (a) => a.activityId === activity.id
                        );
                        const isOver = liveActivityData?.endTime;
                        const isLive =
                          liveActivityData && !liveActivityData?.endTime;

                        return (
                          <div
                            key={activity.id}
                            className={classNames(
                              'flex justify-between space-x-4 hover:bg-slate-100 p-2',
                              {
                                'opacity-60': isOver,
                              }
                            )}>
                            <span>
                              {activity.name} {isLive ? 'Live!' : ''}
                            </span>
                            <span>
                              {formatTimeRange(
                                activity.startTime,
                                activity.endTime
                              )}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CompetitionSchedule;
