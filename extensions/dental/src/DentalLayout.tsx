import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useAppConfig } from '@state';
import { InvestigationalUseDialog, Onboarding, ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@ohif/ui-next';
import { HangingProtocolService, CommandsManager } from '@ohif/core';
import DentalPracticeHeader from './components/DentalPracticeHeader';
import { DentalStateProvider } from './state/DentalStateContext';
import SidePanelWithServices from '../../default/src/Components/SidePanelWithServices';
import useResizablePanels from '../../default/src/ViewerLayout/ResizablePanelsHook';

const resizableHandleClassName = 'mt-[1px] bg-background';

function DentalViewerLayout({
  extensionManager,
  servicesManager,
  hotkeysManager,
  commandsManager,
  viewports,
  ViewportGridComp,
  leftPanelClosed = false,
  rightPanelClosed = false,
  leftPanelResizable = false,
  rightPanelResizable = false,
  leftPanelInitialExpandedWidth,
  rightPanelInitialExpandedWidth,
  leftPanelMinimumExpandedWidth,
  rightPanelMinimumExpandedWidth,
}: any): React.ReactNode {
  const appConfig = ((useAppConfig() as any) || [])[0] || {};
  const { panelService, hangingProtocolService, customizationService } =
    (servicesManager as any).services || {};
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(appConfig.showLoadingIndicator);

  const hasPanels = useCallback((side: string): boolean => !!panelService.getPanels(side).length, [panelService]);

  const [hasRightPanels, setHasRightPanels] = useState(hasPanels('right'));
  const [hasLeftPanels, setHasLeftPanels] = useState(hasPanels('left'));
  const [leftPanelClosedState, setLeftPanelClosed] = useState(leftPanelClosed);
  const [rightPanelClosedState, setRightPanelClosed] = useState(rightPanelClosed);

  const [
    leftPanelProps,
    rightPanelProps,
    resizablePanelGroupProps,
    resizableLeftPanelProps,
    resizableViewportGridPanelProps,
    resizableRightPanelProps,
    onHandleDragging,
  ] = useResizablePanels(
    leftPanelClosed,
    setLeftPanelClosed,
    rightPanelClosed,
    setRightPanelClosed,
    hasLeftPanels,
    hasRightPanels,
    leftPanelInitialExpandedWidth,
    rightPanelInitialExpandedWidth,
    leftPanelMinimumExpandedWidth,
    rightPanelMinimumExpandedWidth
  );

  useEffect(() => {
    document.body.classList.add('bg-background');
    document.body.classList.add('overflow-hidden');

    return () => {
      document.body.classList.remove('bg-background');
      document.body.classList.remove('overflow-hidden');
    };
  }, []);

  useEffect(() => {
    const { unsubscribe } = hangingProtocolService.subscribe(
      HangingProtocolService.EVENTS.PROTOCOL_CHANGED,
      () => {
        setShowLoadingIndicator(false);
      }
    );

    return () => unsubscribe();
  }, [hangingProtocolService]);

  useEffect(() => {
    const { unsubscribe } = panelService.subscribe(panelService.EVENTS.PANELS_CHANGED, (event: any) => {
      const { options } = event || {};
      setHasLeftPanels(hasPanels('left'));
      setHasRightPanels(hasPanels('right'));
      if (options?.leftPanelClosed !== undefined) {
        setLeftPanelClosed(options.leftPanelClosed);
      }
      if (options?.rightPanelClosed !== undefined) {
        setRightPanelClosed(options.rightPanelClosed);
      }
    });

    return () => unsubscribe();
  }, [panelService, hasPanels]);

  const viewportComponents = (viewports as any[]).map((viewportComponent: any) => {
    const entry = (extensionManager as any).getModuleEntry(viewportComponent.namespace) as any;
    if (!entry || !entry.component) {
      throw new Error(`No viewport component found for ${viewportComponent.namespace}`);
    }

    return {
      component: entry.component,
      isReferenceViewable: entry.isReferenceViewable,
      displaySetsToDisplay: viewportComponent.displaySetsToDisplay,
    };
  });

  const handleMouseEnter = () => {
    (document.activeElement as HTMLElement)?.blur();
  };

  const LoadingIndicatorProgress = customizationService.getCustomization('ui.loadingIndicatorProgress') as any;

  return (
    <DentalStateProvider>
      <div>
        <DentalPracticeHeader />
        <div
          className="relative flex w-full flex-row flex-nowrap items-stretch overflow-hidden bg-background"
          style={{ height: 'calc(100vh - 112px)' }}
        >
          <React.Fragment>
            {showLoadingIndicator && <LoadingIndicatorProgress className="h-full w-full bg-background" />}
            <ResizablePanelGroup
              direction="horizontal"
              {...(resizablePanelGroupProps as any)}
            >
              {hasLeftPanels ? (
                <>
                  <ResizablePanel {...(resizableLeftPanelProps as any)}>
                    <SidePanelWithServices
                      side="left"
                      isExpanded={!leftPanelClosedState}
                      servicesManager={servicesManager}
                      activeTabIndex={0}
                      onClose={() => {}}
                      onOpen={() => {}}
                      {...(leftPanelProps as any)}
                    />
                  </ResizablePanel>
                  <ResizableHandle
                    onDragging={onHandleDragging as any}
                    disabled={!leftPanelResizable}
                    className={resizableHandleClassName}
                  />
                </>
              ) : null}

              <ResizablePanel {...(resizableViewportGridPanelProps as any)}>
                <div className="flex h-full flex-1 flex-col">
                  <div
                    className="relative flex h-full flex-1 items-center justify-center overflow-hidden bg-background"
                    onMouseEnter={handleMouseEnter}
                  >
                    <ViewportGridComp
                      servicesManager={servicesManager}
                      viewportComponents={viewportComponents}
                      commandsManager={commandsManager}
                    />
                  </div>
                </div>
              </ResizablePanel>

              {hasRightPanels ? (
                <>
                  <ResizableHandle
                    onDragging={onHandleDragging as any}
                    disabled={!rightPanelResizable}
                    className={resizableHandleClassName}
                  />
                  <ResizablePanel {...(resizableRightPanelProps as any)}>
                    <SidePanelWithServices
                      side="right"
                      isExpanded={!rightPanelClosedState}
                      servicesManager={servicesManager}
                      activeTabIndex={0}
                      onClose={() => {}}
                      onOpen={() => {}}
                      {...(rightPanelProps as any)}
                    />
                  </ResizablePanel>
                </>
              ) : null}
            </ResizablePanelGroup>
          </React.Fragment>
        </div>
        <Onboarding tours={(customizationService as any).getCustomization('ohif.tours')} />
        <InvestigationalUseDialog dialogConfiguration={appConfig?.investigationalUseDialog} />
      </div>
    </DentalStateProvider>
  );
}

DentalViewerLayout.propTypes = {
  extensionManager: PropTypes.shape({
    getModuleEntry: PropTypes.func.isRequired,
  }).isRequired,
  commandsManager: PropTypes.instanceOf(CommandsManager),
  servicesManager: PropTypes.object.isRequired,
  leftPanels: PropTypes.array,
  rightPanels: PropTypes.array,
  leftPanelClosed: PropTypes.bool.isRequired,
  rightPanelClosed: PropTypes.bool.isRequired,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  viewports: PropTypes.array,
};

export default DentalViewerLayout;
