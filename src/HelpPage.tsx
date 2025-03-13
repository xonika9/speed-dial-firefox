import { Component } from 'solid-js';
import { BiRegularLeftArrowAlt } from 'solid-icons/bi';

const HelpPage: Component = () => {
    return (
        <div class='modal-padding-container'>
            <div class='modal' style={{ padding: '10px', position: 'relative' }}>
                <button
                    class='borderless'
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        display: 'flex',
                        gap: '5px',
                    }}
                    onClick={() => history.back()}
                >
                    <BiRegularLeftArrowAlt size={20} />
                    Back
                </button>
            </div>
        </div>
    );
};

export default HelpPage;
