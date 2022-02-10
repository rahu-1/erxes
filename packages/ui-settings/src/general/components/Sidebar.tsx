import { __ } from '@erxes/ui/src/utils';
import LeftSidebar from '@erxes/ui/src/layout/components/Sidebar';
import { SidebarList as List } from '@erxes/ui/src/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import SidebarHeader from '@erxes/ui-settings/src/common/components/SidebarHeader';

class Sidebar extends React.Component<{ isThemeEnabled?: boolean }> {
  renderListItem(url: string, text: string) {
    return (
      <li>
        <Link
          to={url}
          className={window.location.href.includes(url) ? 'active' : ''}
        >
          {__(text)}
        </Link>
      </li>
    );
  }

  render() {
    return (
      <LeftSidebar full={true} header={<SidebarHeader />}>
        <List id="SettingsSidebar">
          {this.renderListItem('/settings/general', 'General system config')}
          {this.renderListItem(
            '/settings/integration-configs',
            'Integrations config'
          )}
          {this.renderListItem('/settings/campaign-configs', 'Campaign config')}

          {this.props.isThemeEnabled
            ? this.renderListItem('/settings/theme', 'Theme config')
            : null}
        </List>
      </LeftSidebar>
    );
  }
}

export default Sidebar;