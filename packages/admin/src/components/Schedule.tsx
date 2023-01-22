import { formatTimeRange } from '@notifycomp/frontend-common/lib';
import { useParams } from 'react-router-dom';
import classNames from 'classnames';
import useActivities from '../hooks/useActivities';

function CompetitionSchedule() {
  const { competitionId } = useParams();

  const { venues, activities } = useActivities(competitionId);

  return (
    <div className="border border-gray-200 p-2 space-y-2">
      <span className="text-lg">Schedule</span>
      <hr />
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
