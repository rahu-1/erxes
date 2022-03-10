import { IButtonMutateProps } from '@erxes/ui/src/types';
import { StepFormWrapper } from '@erxes/ui-engage/src/styles';
import TagForm from '@erxes/ui/src/tags/components/Form';
import { ITag } from '@erxes/ui/src/tags/types';
import React from 'react';

type Props = {
  tags?: ITag[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  afterSave: () => void;
};

const Form = ({ renderButton, afterSave, tags }: Props) => {
  return (
    <StepFormWrapper>
      <TagForm
        type="customer"
        renderButton={renderButton}
        afterSave={afterSave}
        tags={tags || []}
      />
    </StepFormWrapper>
  );
};

export default Form;