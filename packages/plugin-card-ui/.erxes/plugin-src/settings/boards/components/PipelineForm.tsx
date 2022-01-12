import { COLORS } from '@erxes/ui/src/constants/colors';
import { FlexContent } from '@erxes/ui-cards/src/boards/styles/item';
import { IBoard, IPipeline, IStage } from '@erxes/ui-cards/src/boards/types';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { colors } from '@erxes/ui/src/styles';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import { ExpandWrapper } from '@erxes/ui-settings/src/styles';
import { ColorPick, ColorPicker } from '@erxes/ui/src/styles/main';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import React from 'react';
import Modal from 'react-bootstrap/Modal';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import Select from 'react-select-plus';
import { SelectMemberStyled } from '../styles';
import { IOption } from '../types';
import BoardNumberConfigs from './numberConfig/BoardNumberConfigs';
import Stages from './Stages';

type Props = {
  type: string;
  show: boolean;
  boardId: string;
  pipeline?: IPipeline;
  stages?: IStage[];
  boards: IBoard[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  options?: IOption;
  renderExtraFields?: (formProps: IFormProps) => JSX.Element;
  extraFields?: any;
};

type State = {
  stages: IStage[];
  visibility: string;
  selectedMemberIds: string[];
  backgroundColor: string;
  isCheckUser: boolean;
  excludeCheckUserIds: string[];
  boardId: string;
  numberConfig?: string;
  numberSize?: string;
};

class PipelineForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { pipeline, stages } = this.props;

    this.state = {
      stages: (stages || []).map(stage => ({ ...stage })),
      visibility: pipeline ? pipeline.visibility || 'public' : 'public',
      selectedMemberIds: pipeline ? pipeline.memberIds || [] : [],
      backgroundColor:
        (pipeline && pipeline.bgColor) || colors.colorPrimaryDark,
      isCheckUser: pipeline ? pipeline.isCheckUser || false : false,
      excludeCheckUserIds: pipeline ? pipeline.excludeCheckUserIds || [] : [],
      boardId: props.boardId || '',
      numberConfig: (pipeline && pipeline.numberConfig) || '',
      numberSize: (pipeline && pipeline.numberSize) || ''
    };
  }

  onChangeStages = stages => {
    this.setState({ stages });
  };

  onChangeVisibility = (e: React.FormEvent<HTMLElement>) => {
    this.setState({
      visibility: (e.currentTarget as HTMLInputElement).value
    });
  };

  onChangeMembers = items => {
    this.setState({ selectedMemberIds: items });
  };

  onChangeDominantUsers = items => {
    this.setState({ excludeCheckUserIds: items });
  };

  collectValues = items => {
    return items.map(item => item.value);
  };

  onColorChange = e => {
    this.setState({ backgroundColor: e.hex });
  };

  onChangeNumber = (key: string, value: string) => {
    this.setState({ [key]: value } as any);
  };

  generateDoc = (values: {
    _id?: string;
    name: string;
    visibility: string;
  }) => {
    const { pipeline, type, extraFields } = this.props;
    const {
      selectedMemberIds,
      stages,
      backgroundColor,
      isCheckUser,
      excludeCheckUserIds,
      boardId,
      numberConfig,
      numberSize
    } = this.state;
    const finalValues = values;

    if (pipeline) {
      finalValues._id = pipeline._id;
    }

    return {
      ...finalValues,
      ...extraFields,
      type,
      boardId,
      stages: stages.filter(el => el.name),
      memberIds: selectedMemberIds,
      bgColor: backgroundColor,
      isCheckUser,
      excludeCheckUserIds,
      numberConfig,
      numberSize
    };
  };

  renderNumberInput() {
    return (
      <FormGroup>
        <BoardNumberConfigs
          onChange={(key: string, conf: string) =>
            this.onChangeNumber(key, conf)
          }
          config={this.state.numberConfig || ''}
          size={this.state.numberSize || ''}
        />
      </FormGroup>
    );
  }

  renderSelectMembers() {
    const { visibility, selectedMemberIds } = this.state;

    if (visibility === 'public') {
      return;
    }

    return (
      <FormGroup>
        <SelectMemberStyled zIndex={2002}>
          <ControlLabel>Members</ControlLabel>

          <SelectTeamMembers
            label="Choose members"
            name="selectedMemberIds"
            initialValue={selectedMemberIds}
            onSelect={this.onChangeMembers}
          />
        </SelectMemberStyled>
      </FormGroup>
    );
  }

  onChangeIsCheckUser = e => {
    const isChecked = (e.currentTarget as HTMLInputElement).checked;
    this.setState({ isCheckUser: isChecked });
  };

  renderDominantUsers() {
    const { isCheckUser, excludeCheckUserIds } = this.state;

    if (!isCheckUser) {
      return;
    }

    return (
      <FormGroup>
        <SelectMemberStyled>
          <ControlLabel>
            Users eligible to see all {this.props.type}
          </ControlLabel>

          <SelectTeamMembers
            label="Choose members"
            name="excludeCheckUserIds"
            initialValue={excludeCheckUserIds}
            onSelect={this.onChangeDominantUsers}
          />
        </SelectMemberStyled>
      </FormGroup>
    );
  }

  renderBoards() {
    const { boards } = this.props;

    const boardOptions = boards.map(board => ({
      value: board._id,
      label: board.name
    }));

    const onChange = item => this.setState({ boardId: item.value });

    return (
      <FormGroup>
        <ControlLabel required={true}>Board</ControlLabel>
        <Select
          placeholder={__('Choose a board')}
          value={this.state.boardId}
          options={boardOptions}
          onChange={onChange}
          clearable={false}
        />
      </FormGroup>
    );
  }

  renderContent = (formProps: IFormProps) => {
    const {
      pipeline,
      renderButton,
      closeModal,
      options,
      renderExtraFields
    } = this.props;
    const { values, isSubmitted } = formProps;
    const object = pipeline || ({} as IPipeline);
    const pipelineName =
      options && options.pipelineName
        ? options.pipelineName.toLowerCase()
        : 'pipeline';

    const popoverBottom = (
      <Popover id="color-picker">
        <TwitterPicker
          width="266px"
          triangle="hide"
          color={this.state.backgroundColor}
          onChange={this.onColorChange}
          colors={COLORS}
        />
      </Popover>
    );

    return (
      <div id="manage-pipeline-modal">
        <Modal.Header closeButton={true}>
          <Modal.Title>
            {pipeline ? `Edit ${pipelineName}` : `Add ${pipelineName}`}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <FormGroup>
            <ControlLabel required={true}>Name</ControlLabel>
            <FormControl
              {...formProps}
              name="name"
              defaultValue={object.name}
              autoFocus={true}
              required={true}
            />
          </FormGroup>

          {renderExtraFields && renderExtraFields(formProps)}

          <FlexContent>
            <ExpandWrapper>
              <FormGroup>
                <ControlLabel required={true}>Visibility</ControlLabel>
                <FormControl
                  {...formProps}
                  name="visibility"
                  componentClass="select"
                  value={this.state.visibility}
                  onChange={this.onChangeVisibility}
                >
                  <option value="public">{__('Public')}</option>
                  <option value="private">{__('Private')}</option>
                </FormControl>
              </FormGroup>
            </ExpandWrapper>
            <FormGroup>
              <ControlLabel>Background</ControlLabel>
              <div>
                <OverlayTrigger
                  trigger="click"
                  rootClose={true}
                  placement="bottom"
                  overlay={popoverBottom}
                >
                  <ColorPick>
                    <ColorPicker
                      style={{ backgroundColor: this.state.backgroundColor }}
                    />
                  </ColorPick>
                </OverlayTrigger>
              </div>
            </FormGroup>
          </FlexContent>

          {this.renderBoards()}

          {this.renderSelectMembers()}

          {this.renderNumberInput()}

          <FormGroup>
            <ControlLabel>
              {__(`Show only the user's assigned(created)`)} {this.props.type}
            </ControlLabel>
            <FormControl
              componentClass="checkbox"
              checked={this.state.isCheckUser}
              onChange={this.onChangeIsCheckUser}
            />
          </FormGroup>

          {this.renderDominantUsers()}

          <FormGroup>
            <ControlLabel>Stages</ControlLabel>
            <div id="stages-in-pipeline-form">
              <Stages
                options={options}
                type={this.props.type}
                stages={this.state.stages}
                onChangeStages={this.onChangeStages}
              />
            </div>
          </FormGroup>

          <Modal.Footer>
            <Button
              btnStyle="simple"
              type="button"
              icon="times-circle"
              onClick={closeModal}
            >
              Cancel
            </Button>

            {renderButton({
              name: pipelineName,
              values: this.generateDoc(values),
              isSubmitted,
              callback: closeModal,
              object: pipeline,
              confirmationUpdate: true
            })}
          </Modal.Footer>
        </Modal.Body>
      </div>
    );
  };

  render() {
    const { show, closeModal } = this.props;

    if (!show) {
      return null;
    }

    return (
      <Modal
        show={show}
        onHide={closeModal}
        enforceFocus={false}
        animation={false}
        size="lg"
      >
        <Form renderContent={this.renderContent} />
      </Modal>
    );
  }
}

export default PipelineForm;