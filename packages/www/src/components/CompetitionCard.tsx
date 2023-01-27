import { formatTime } from '@notifycomp/frontend-common';
import { useEffect, useState } from 'react';
import { Card, Progress } from 'react-bulma-components';
import { Link } from 'react-router-dom';
import { BarLoader } from 'react-spinners';
import { Competition } from '../generated/graphql';
import useWCIF from '../hooks/useWCIF';
import Flag from './Flag';

interface CompetitionCardProps extends Competition {}

function CompetitionCard({
  id,
  name,
  country,
  activities,
}: CompetitionCardProps) {
  const { allActivities, isLoading } = useWCIF(id);

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  });

  const ongoingActivities = activities?.filter(
    (activity) => activity.startTime && !activity.endTime
  );

  return (
    <Link to={`/competitions/${id}`}>
      <Card>
        {isLoading ? (
          <BarLoader width="100%" />
        ) : (
          <div style={{ height: '4px' }} />
        )}
        <Card.Header>
          <Card.Header.Icon>
            <Flag code={country.toLowerCase()} className="is-size-4" />
          </Card.Header.Icon>
          <Card.Header.Title>{name}</Card.Header.Title>
        </Card.Header>
        <Card.Content className="flex flex-col">
          <p className="is-size-5">Ongoing</p>
          <div className="list">
            {ongoingActivities?.map((activity) => {
              const activityData = allActivities?.find(
                (a) => a.id === activity.activityId
              );

              if (!activityData || !activity.startTime) return null;

              const estimatedMinutes = Math.round(
                (new Date(activityData.endTime).getTime() -
                  new Date(activityData.startTime).getTime()) /
                  1000 /
                  60
              );

              const elapsedDuration =
                now.getTime() - new Date(activity.startTime).getTime();
              const elapsedHours = elapsedDuration / 1000 / 60 / 60;
              const elapsedMinutes = elapsedDuration / 1000 / 60;
              const elapsedSeconds = (elapsedDuration / 1000) % 60;
              const elapsedTimeString =
                elapsedDuration < 1000
                  ? '00:00'
                  : [
                      elapsedMinutes > 60
                        ? Math.floor(elapsedHours).toString().padStart(2, '0')
                        : null,
                      Math.floor(elapsedMinutes % 60)
                        .toString()
                        .toString()
                        .padStart(2, '0'),
                      Math.floor(elapsedSeconds).toString().padStart(2, '0'),
                    ]
                      .filter(Boolean)
                      .join(':');

              return (
                <div key={activity.activityId} className="list-item">
                  <div className="flex justify-between items-center">
                    <span>{activityData.name} </span>
                  </div>
                  <Progress
                    size="small"
                    colorVariant={
                      elapsedMinutes > estimatedMinutes ? 'danger' : 'primary'
                    }
                    max={estimatedMinutes}
                    value={elapsedMinutes}
                    style={{
                      margin: 0,
                      marginTop: '0.25em',
                      marginBottom: '0.25em',
                      height: '0.5em',
                    }}
                  />
                  <div className="flex justify-around">
                    <div className="flex flex-col text-center">
                      <span className="text-sm">Start</span>
                      <b>{formatTime(activity.startTime)}</b>
                      {activity.startTime === activityData.startTime ? null : (
                        <span className="text-xs line-through">
                          {formatTime(activityData.startTime)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col justify-center text-center">
                      <b className="font-mono">{elapsedTimeString}</b>
                    </div>
                    <div className="flex flex-col text-center">
                      <span className="text-sm">Scheduled End</span>
                      <b>{formatTime(activityData.endTime)}</b>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card.Content>
      </Card>
    </Link>
  );
}
export default CompetitionCard;
