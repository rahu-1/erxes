import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { dimensions, colors } from 'modules/common/styles';
import { TriggerBox } from 'modules/automations/styles';
import { rgba } from 'modules/common/styles/color';

export const ActionFooter = styled.div`
  position: absolute;
  bottom: ${dimensions.coreSpacing}px;
`;

export const Attributes = styled.ul`
  list-style: none;
  margin: 0;
  right: 20px;
  height: 200px;
  overflow: auto;
  padding: ${dimensions.unitSpacing}px;
  border-radius: ${dimensions.unitSpacing - 5}px;

  b {
    margin-bottom: ${dimensions.unitSpacing + 10}px;
    color: black;
  }

  li {
    color: ${colors.colorCoreGray};
    padding-bottom: ${dimensions.unitSpacing - 5}px;
    cursor: pointer;
    transition: all ease 0.3s;

    &:hover {
      color: ${colors.textPrimary};
    }
  }
`;

export const ActionBox = styledTS<{
  isFavourite: boolean;
  isAvailable: boolean;
}>(styled(TriggerBox))`
    flex-direction: row;
    margin-top: ${dimensions.unitSpacing}px;
    margin-right: 0;
    position: relative;
    pointer-events: ${props => !props.isAvailable && 'none'};
  
    > i {
      margin-right: ${dimensions.unitSpacing}px;
      background: ${rgba(colors.colorPrimary, 0.12)};
      border-radius: 4px;
      width: 45px;
      height: 45px;
      line-height: 45px;
      text-align: center;
      font-size: 22px;
      flex-shrink: 0;
      color: ${colors.textPrimary};
    }
  
    > div {
      b {
        color: ${colors.textPrimary};
      }
      p {
        margin: 0;
        max-width: 350px;
      }
      span {
        padding-left: ${dimensions.unitSpacing}px;
        color: ${colors.colorCoreOrange};
        font-weight: 500;
      }
    }
  
    .favourite-action {
      position: absolute;
      width: 30px;
      text-align: right;
      right: ${dimensions.coreSpacing}px;
  
      > i {
        color: ${props => props.isFavourite && colors.colorCoreOrange}
      }
    }
  `;