import React, { Component, Fragment } from 'react';
import { Button, Upload, Icon } from 'antd';

import withFieldWrapper from '../../hocs/withFieldWrapper';
import withFileUrlContext from '../../hocs/withFileUrlContext';

class Uploader extends Component {
    state = {
        error: false
    };

    reader = new FileReader();

    beforeUpload = file => {
        this.reader.readAsDataURL(file);
        this.reader.onload = () => this.props.onChange({
            body: this.reader.result,
            name: file.name
        });

        return false;
    }

    onChange = info => {
        const { status, response, name } = info.file;

        switch (status) {
            case 'done':
                this.props.onChange({ id: response.id, name });
                this.state.error && this.setState({ error: false });
                break;
            case 'error':
                this.setState({ error: true });
                break;
            default:
                return;
        }
    }

    delete = () => this.props.onChange(null);

    render() {
        const { input: { value }, uploadUrl, accept } = this.props;
        const props = uploadUrl ? {
            action: uploadUrl,
            onChange: this.onChange
        } : {
            beforeUpload: this.beforeUpload
        };

        return value ?
            <Fragment>
                <span style={{ marginRight: 15 }}>{ value.name }</span>
                <Button type='danger' onClick={this.delete}>
                    <Icon type='delete' /> Удалить
                </Button>
            </Fragment> :
            <Fragment>
                <Upload
                    {...props}
                    accept={accept}
                    showUploadList={false}>
                    <Button>
                        <Icon type='upload' /> Загрузить файл
                    </Button>
                </Upload>
                { this.state.error && <div style={{ color: 'red' }}>Не удалось загрузить файл</div> }
            </Fragment>;
    }
}

export default withFieldWrapper(withFileUrlContext(Uploader));
