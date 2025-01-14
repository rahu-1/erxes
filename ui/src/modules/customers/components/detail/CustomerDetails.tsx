import ActivityInputs from 'modules/activityLogs/components/ActivityInputs';
import ActivityLogs from 'modules/activityLogs/containers/ActivityLogs';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { TabTitle } from 'modules/common/components/tabs';
import { __, renderFullName } from 'modules/common/utils';
import ActionSection from 'modules/customers/containers/common/ActionSection';
import LeadState from 'modules/customers/containers/LeadState';
import { MailBox, UserHeader } from 'modules/customers/styles';
import Widget from 'modules/engage/containers/Widget';
import Wrapper from 'modules/layout/components/Wrapper';
import MailForm from 'modules/settings/integrations/containers/mail/MailForm';
import { IField } from 'modules/settings/properties/types';
import React from 'react';
import { ICustomer } from '../../types';
import InfoSection from '../common/InfoSection';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

type Props = {
  customer: ICustomer;
  fields: IField[];
  deviceFields: IField[];
  taggerRefetchQueries?: any[];
};

class CustomerDetails extends React.Component<Props> {
  renderEmailTab = () => {
    const { customer } = this.props;

    if (!customer.primaryEmail) {
      return null;
    }

    const triggerEmail = (
      <TabTitle>
        <Icon icon="envelope-add" /> {__('New email')}
      </TabTitle>
    );

    const content = props => (
      <MailBox>
        <MailForm
          fromEmail={customer.primaryEmail}
          refetchQueries={['activityLogsCustomer']}
          closeModal={props.closeModal}
        />
      </MailBox>
    );

    return (
      <ModalTrigger
        dialogClassName="middle"
        title="Email"
        trigger={triggerEmail}
        size="xl"
        content={content}
        paddingContent="less-padding"
        enforceFocus={false}
      />
    );
  };

  renderExtraTabs = () => {
    const triggerMessenger = (
      <TabTitle>
        <Icon icon="comment-plus" /> {__('New message')}
      </TabTitle>
    );

    return (
      <>
        <Widget
          customers={[this.props.customer]}
          modalTrigger={triggerMessenger}
          channelType="messenger"
        />
        {this.renderEmailTab()}
      </>
    );
  };

  render() {
    const { customer, fields, deviceFields, taggerRefetchQueries } = this.props;

    const breadcrumb = [
      { title: __('Contacts'), link: '/contacts' },
      { title: renderFullName(customer) }
    ];

    const content = (
      <>
        <ActivityInputs
          contentTypeId={customer._id}
          contentType="customer"
          toEmail={customer.primaryEmail}
          showEmail={false}
          extraTabs={this.renderExtraTabs()}
        />
        <ActivityLogs
          target={customer.firstName}
          contentId={customer._id}
          contentType="customer"
          extraTabs={[
            { name: 'conversation', label: 'Conversation' },
            { name: 'email', label: 'Email' },
            { name: 'task', label: 'Task' },
            { name: 'sms', label: 'SMS' },
            { name: 'campaign', label: 'Campaign' }
          ]}
        />
      </>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={renderFullName(customer)}
            breadcrumb={breadcrumb}
          />
        }
        mainHead={
          <UserHeader>
            <InfoSection nameSize={16} avatarSize={60} customer={customer}>
              <ActionSection customer={customer} />
            </InfoSection>
            <LeadState customer={customer} />
          </UserHeader>
        }
        leftSidebar={
          <LeftSidebar
            wide={true}
            customer={customer}
            fields={fields}
            deviceFields={deviceFields}
            taggerRefetchQueries={taggerRefetchQueries}
          />
        }
        rightSidebar={<RightSidebar customer={customer} />}
        content={content}
        transparent={true}
      />
    );
  }
}

export default CustomerDetails;
