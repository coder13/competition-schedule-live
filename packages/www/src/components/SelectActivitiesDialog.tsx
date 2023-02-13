import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { parseActivityCode } from '@wca/helpers';
import { useMemo } from 'react';
import { Block, Modal } from 'react-bulma-components';
import { useParams } from 'react-router-dom';
import matchesActivityCode from '../helpers/MatchesActivtyCode/MatchesActivityCode';
import useWCIF from '../hooks/useWCIF';
import {
  getCompetitionSubscriptions,
  updateCompetitionSubscriptions,
} from '../notifapi';
import { List, ListItem } from './List';
import TriStateCheckIcon from './TriStateCheckIcon';

interface SelectCompetitorsDialogProps {
  open: boolean;
  onClose: () => void;
}

type SubscriptionWithId = Subscription & { id: number };

function SelectCompetitorsDialog({
  open,
  onClose,
}: SelectCompetitorsDialogProps) {
  const params = useParams();
  const queryClient = useQueryClient();

  const competitionId = params.competitionId as string; // It is *going* to exist
  const { rooms, allUniqueActivityCodes, getActivitiesForActivityCode } =
    useWCIF(competitionId);
  const { data: subscriptions } = useQuery({
    queryKey: ['subscriptions', 'competitions', competitionId],
    queryFn: async () =>
      (await getCompetitionSubscriptions(competitionId))[
        'subscriptions'
      ] as Subscription[],
  });

  const roomActivities = rooms?.map((room) => room.activities).flat();
  const roomActivityCodes = [
    ...new Set(roomActivities?.map((a) => a.activityCode)),
  ];

  const selectedActivityCodes = subscriptions
    ?.filter((s) => s.type === 'activity')
    .map((s) => s.value);

  const allRoundsSelected = useMemo(() => {
    if (!selectedActivityCodes?.length) {
      return false;
    }
    if (selectedActivityCodes?.includes('*')) {
      return true;
    } else {
      return 'some';
    }
  }, [selectedActivityCodes]);

  const toggleSubscriptions = useMutation({
    mutationFn: (toggleSubs: Subscription[]) => {
      const newSubscriptions = toggleSubs.reduce(
        (acc = [], sub): Subscription[] => {
          if (sub.type === 'competitor') {
            const index = acc.findIndex(
              (s) => s.type === sub.type && s.value === sub.value
            );

            if (index !== -1) {
              return acc.filter((_, i) => i !== index);
            } else {
              return [...acc, sub];
            }
          }

          if (sub.value === '*') {
            if (allRoundsSelected === true) {
              // we're toggling off all activities
              return acc.filter((s) => s.type !== 'activity');
            }

            return [
              ...acc.filter((s) => s.type !== 'activity'),
              {
                type: 'activity',
                value: '*',
              },
            ];
          }

          const parent = sub.value.split('-').slice(0, -1).join('-');

          if (allRoundsSelected === true) {
            // if it's a round, turn off all rounds, then turn on all other rounds except the round this child belongs to
            if (roomActivityCodes.includes(sub.value)) {
              return [
                ...acc.filter((s) => s.value !== '*'),
                ...roomActivityCodes
                  .filter((ra) => ra !== sub.value)
                  .map((a) => ({ type: 'activity', value: a } as Subscription)),
              ];
            } else {
              // So we need to turn off the all rounds filter, turn on all rounds except the round this child belongs to, then turn on the child's siblings keeping it off
              return [
                ...acc.filter((s) => s.value !== '*'),
                ...roomActivityCodes
                  .filter((a) => a !== parent)
                  .map((a) => ({ type: 'activity', value: a } as Subscription)),
                ...allUniqueActivityCodes
                  .filter(
                    (a) =>
                      matchesActivityCode(parent)(a) &&
                      a !== parent &&
                      a !== sub.value
                  )
                  .map((a) => ({ type: 'activity', value: a } as Subscription)),
              ];
            }
          }

          const isLiterallyPresent = acc.some((s) => s.value === sub.value);

          if (isLiterallyPresent) {
            return acc.filter((s) => s.value !== sub.value);
          }

          // so the sub is not literally present
          // is it's parent present?

          const isParentLiterallyPresent = acc.some((s) => s.value === parent);

          const siblingActivityCodes =
            allUniqueActivityCodes.filter(
              (a) => matchesActivityCode(parent)(a) && a !== parent
            ) || []; // this is all the siblings

          const enabledSiblingActivityCodes =
            selectedActivityCodes?.filter((sa) =>
              siblingActivityCodes.includes(sa)
            ) || []; // this is all the siblings that are enabled

          if (
            roomActivityCodes?.every(
              (ra) =>
                ra === sub.value ||
                selectedActivityCodes?.some((s) => s === ra) ||
                (ra === parent &&
                  siblingActivityCodes.every(
                    (sa) =>
                      sa === sub.value ||
                      enabledSiblingActivityCodes.includes(sa)
                  ))
            )
          ) {
            // if almost all rounds are selected, then we're replacing all rounds with * selector
            return [
              ...acc.filter((s) => s.type !== 'activity'),
              {
                type: 'activity',
                value: '*',
              },
            ];
          }

          if (isParentLiterallyPresent) {
            // If the parent is present, then we're toggling sub off. We need to leave it's siblings on though
            return [
              ...acc.filter((s) => s.value !== parent),
              ...siblingActivityCodes
                .filter((s) => s != sub.value)
                .map(
                  (s) =>
                    ({
                      type: 'activity',
                      value: s,
                    } as Subscription)
                ),
            ];
          }

          // sub is not present, parent is not present
          // that means we're toggling sub on

          if (roomActivityCodes.includes(sub.value)) {
            // if it's a round then we just want to turn it on.
            return [...acc, sub];
          }

          // if all of the other siblings are on, then we want to toggle the parent on and the siblings off
          if (
            enabledSiblingActivityCodes.length ===
            siblingActivityCodes.length - 1
          ) {
            return [
              ...acc.filter(
                (s) =>
                  s.type !== 'activity' || !matchesActivityCode(parent)(s.value)
              ),
              { type: 'activity', value: parent },
            ];
          }

          // if not enough siblings are on, then we just want to toggle the sub on
          // But we need to remove children if it has any
          return [
            ...acc.filter(
              (s) =>
                s.type !== 'activity' ||
                !matchesActivityCode(sub.value)(s.value)
            ),
            sub,
          ];
        },
        subscriptions
      );

      return updateCompetitionSubscriptions(
        competitionId,
        newSubscriptions || []
      );
    },
    onSuccess: (data) => {
      // Replace the entire array with the new array since we are bulk modifying *all* of the subscriptions with this endpoint
      queryClient.setQueryData<Subscription[]>(
        ['subscriptions', 'competitions', competitionId],
        data.subscriptions
      );
    },
  });

  const toggleSelected = (activityCode: string) => {
    toggleSubscriptions.mutate([{ type: 'activity', value: activityCode }]);
  };

  const countNotifications = useMemo(() => {
    if (!selectedActivityCodes) {
      return 0;
    }

    if (selectedActivityCodes.includes('*')) {
      const childActivityCodes = roomActivityCodes.flatMap((activityCode) => {
        const roundActivitiesForActivityCode =
          getActivitiesForActivityCode(activityCode);

        return roundActivitiesForActivityCode?.flatMap((a) => {
          if (a.activityCode === 'other-misc') {
            return a.activityCode + a.name;
          }

          return a.childActivities?.length
            ? a.childActivities.map((ca) => ca.activityCode)
            : a.activityCode;
        });
      });
      return [...new Set(childActivityCodes)].length;
    }

    return selectedActivityCodes.reduce((acc, activityCode) => {
      const roundActivitiesForActivityCode =
        getActivitiesForActivityCode(activityCode);

      const childActivityCodes = roundActivitiesForActivityCode?.flatMap(
        (a) => {
          return a.childActivities?.length
            ? a.childActivities.map((ca) => ca.activityCode)
            : a.activityCode;
        }
      );

      return acc + [...new Set(childActivityCodes)].length || 1;
    }, 0);
  }, [selectedActivityCodes, getActivitiesForActivityCode]);

  return (
    <Modal show={open} onClose={onClose} showClose={false}>
      <Modal.Card>
        <Modal.Card.Header>
          <Modal.Card.Title>Select Activites</Modal.Card.Title>
        </Modal.Card.Header>
        <Modal.Card.Body>
          <div
            style={{
              marginLeft: '-1em',
              marginRight: '-1em',
            }}>
            <ListItem
              icon={<TriStateCheckIcon checked={allRoundsSelected} />}
              primaryText="All Rounds"
              onClick={() => {
                toggleSelected('*');
              }}
            />
          </div>

          <List>
            {roomActivityCodes.map((activityCode) => {
              const roundActivitiesForActivityCode =
                getActivitiesForActivityCode(activityCode);
              const isSelected = selectedActivityCodes?.some((a) =>
                matchesActivityCode(a)(activityCode)
              );
              const hasSome = roundActivitiesForActivityCode?.some((ra) =>
                ra.childActivities?.some((ca) =>
                  selectedActivityCodes?.some((a) =>
                    matchesActivityCode(a)(ca.activityCode)
                  )
                )
              );

              const childActivities = roundActivitiesForActivityCode
                ?.map((ra) => ra.childActivities)
                ?.flat();
              const childActivityCodes = [
                ...new Set(
                  childActivities
                    ?.map((ca) => ca?.activityCode)
                    .filter(Boolean) || []
                ),
              ].sort() as string[];

              return (
                <ListItem
                  key={activityCode}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelected(activityCode);
                  }}
                  icon={
                    <TriStateCheckIcon
                      checked={isSelected ? true : !!hasSome && 'some'}
                    />
                  }
                  primaryText={roundActivitiesForActivityCode?.[0]?.name || ''}
                  children={
                    childActivityCodes?.length ? (
                      <Block>
                        {childActivityCodes.map((childActivityCode) => {
                          const { groupNumber } =
                            parseActivityCode(childActivityCode);

                          return (
                            <ListItem
                              key={childActivityCode}
                              primaryText={`Group ${groupNumber}`}
                              icon={
                                selectedActivityCodes?.some((a) =>
                                  matchesActivityCode(a)(childActivityCode)
                                ) ? (
                                  <i className="fa-regular fa-square-check" />
                                ) : (
                                  <i className="fa-regular fa-square" />
                                )
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelected(childActivityCode);
                              }}
                            />
                          );
                        })}
                      </Block>
                    ) : undefined
                  }
                />
              );
            })}
          </List>
        </Modal.Card.Body>
        <Modal.Card.Footer className="flex flex-col items-start">
          <span>
            Select rounds, groups, or other activities to receive notifications
            for when they are starting
          </span>
          <span>Signed up for {countNotifications} activity notifications</span>
        </Modal.Card.Footer>
      </Modal.Card>
    </Modal>
  );
}

export default SelectCompetitorsDialog;
