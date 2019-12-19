import React, { Component, Fragment } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button, Spin, Modal } from 'antd';
import cx from 'classnames';
import { pathOr } from 'ramda';
import PdfViewer from 'pdfjs-viewer-react';

import { withElementWrapper } from '../../hocs/withElementWrapper';
import withFileUrlContext from '../../hocs/withFileUrlContext';
import styles from '../../css/pdf.scss';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const Spinner = () =>
    <div className={cx(styles.pdfSpin, 'pdf-spin')}>
        <Spin />
    </div>;

class PdfField extends Component {
    state = {
        numPages: null,
        pageNumber: 1,
        fullScreen: false
    };

    onLoadSuccess = ({ numPages }) => this.setState({ numPages, pageNumber: 1 });

    back = () => this.setState(prev => ({ pageNumber: prev.pageNumber - 1 }));

    next = () => this.setState(prev => ({ pageNumber: prev.pageNumber + 1 }));

    getWidth = () => {
        return this.props.width || (this.pageRef ? this.pageRef.ref.clientWidth : 450);
    }

    openFullPdf = () => {
        this.setState({ fullScreen: true });
    }

    closeFullPdf = () => {
        this.setState({ fullScreen: false });
    }

    renderPdf = () => {
        const { file, downloadUrl } = this.props;
        const fileUrl = file.id ? downloadUrl(file.id) : file.body;
        const { pageNumber, numPages } = this.state;

        return <div className={cx(styles.pdf, 'pdf-component')}>
            <div className={cx(styles.pdfPageButtons, 'pdf-page-buttons')}>
                <Button.Group>
                    <Button icon='left' onClick={this.back} disabled={pageNumber < 2} />
                    <Button icon='right' onClick={this.next} disabled={pageNumber >= numPages} />
                    <Button icon='fullscreen' onClick={this.openFullPdf} />
                </Button.Group>
            </div>
            <iframe src={`/pdf-viewer/viewer.html?file=${fileUrl}`} width='100%' height='100%' />
            {/* <PdfViewer file={fileUrl} width="333px" height="532px"></PdfViewer> */}
            <div style={{ minHeight: pathOr(0, ['ref', 'clientHeight'], this.pageRef) }}>
                <Document
                    ref={node => this.pdf = node}
                    file={fileUrl}
                    onLoadSuccess={this.onLoadSuccess}
                    loading={<Spinner />}>
                    <Page
                        ref={node => this.pageRef = node}
                        pageNumber={pageNumber}
                        width={this.getWidth()}
                        loading={<Spinner />} />
                </Document>
                <Modal
                    className={cx(styles.pdfFullView, 'pdf-fullview')}
                    visible={this.state.fullScreen}
                    closable={false}
                    footer={<Button onClick={this.closeFullPdf}>Закрыть</Button>}
                    width='100%'
                    destroyOnClose>
                    <iframe height='100%' width='100%' scrolling='no' frameBorder="0" src={fileUrl}></iframe>
                </Modal>
            </div>
            <div className={cx(styles.pdfFooter, 'pdf-footer')}>
                { pageNumber } / { numPages }
            </div>
        </div>;
    }

    render() {
        const { file, label } = this.props;

        return <Fragment>
            <div dangerouslySetInnerHTML={{ __html: label }} />
            { file ? this.renderPdf() : null }
        </Fragment>;
    }
}

export const PdfComponent = withFileUrlContext(PdfField);

export default withElementWrapper(PdfComponent);
