import React from 'react';
import gql from 'graphql-tag';
import { useMutation } from 'react-apollo';

import { Alert, confirm } from '@erxes/ui/src/utils';
import { mutations } from '../../graphql';
import Item from '../../components/unit/Item';
import { IUnit } from '@erxes/ui-team/src/types';

type Props = {
  unit: IUnit;
  refetch: () => void;
};

export default function ItemContainer(props: Props) {
  const [deleteMutation] = useMutation(gql(mutations.unitsRemove));

  const deleteDepartment = (_id: string, callback: () => void) => {
    confirm().then(() => {
      deleteMutation({ variables: { _id } })
        .then(() => {
          callback();

          Alert.success('Successfully deleted');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    });
  };

  return <Item {...props} deleteDepartment={deleteDepartment} />;
}