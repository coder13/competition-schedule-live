import { MouseEventHandler, useState } from 'react';
import { Icon, Panel } from 'react-bulma-components';
import PanelBlockWithHover from './PanelBlockWithHover';

export const List = ({ children }: { children: React.ReactNode }) => {
  return (
    <Panel
      shadowless
      style={{
        margin: '-0.5em',
      }}>
      {children}
    </Panel>
  );
};

export const ListItem = ({
  children,
  onClick,
  icon,
  primaryText,
  secondaryText,
  defaultOpen = false,
}: {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: MouseEventHandler<HTMLDivElement>;
  primaryText: string;
  secondaryText?: string;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <PanelBlockWithHover>
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}>
        <div
          onClick={onClick}
          style={{
            display: 'flex',
            alignItems: 'center',
          }}>
          {icon && <Icon size="medium">{icon}</Icon>}
          <div className="flex flex-1 flex-col">
            <span>{primaryText}</span>
            {secondaryText && (
              <span className="font-normal text-xs" style={{ color: '#666' }}>
                {secondaryText}
              </span>
            )}
          </div>
          {children && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setOpen(!open);
              }}>
              <Icon size="medium">
                <i
                  className={
                    open
                      ? 'fas fa-regular fa-chevron-up'
                      : 'fas fa-regular fa-chevron-down'
                  }
                />
              </Icon>
            </div>
          )}
        </div>
        {open && <div>{children}</div>}
      </div>
    </PanelBlockWithHover>
  );
};
