import { useId, forwardRef, useImperativeHandle, useRef } from 'react';
import useInput, { useRadioInput } from '../../../hooks/useInput';
import { motion } from 'framer-motion';
import { UilEditAlt, UilCheck } from '@iconscout/react-unicons';
import ErrorMessage from '../../ui/error/ErrorMessage';

export const HeaderProfile = ({ title, isUpdate, onToggleUpdate }) => {
  const motionAnimate = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
    },
    transition: { duration: 0.4 },
  };
  return (
    <div className="text-[18px] text-start w-full px-2 py-1 bg-blue-200 rounded-sm text-white flex justify-between items-center">
      <h3>{title}</h3>
      <div onClick={onToggleUpdate}>
        {!isUpdate && (
          <motion.div {...motionAnimate}>
            <UilEditAlt className="cursor-pointer p-0.5" size="30" />
          </motion.div>
        )}
        {isUpdate && (
          <motion.div {...motionAnimate}>
            <UilCheck className="cursor-pointer p-0.5" size="30" />
          </motion.div>
        )}
      </div>
    </div>
  );
};
// value, isValid, isInValid, reset,
export const InputInformation = forwardRef(
  (
    {
      icon,
      title,
      type,
      placeholder,
      width,
      readOnly,
      validateFunction,
      errorText,
    },
    ref,
  ) => {
    const {
      state: { value, isValid, isInValid },
      actions: { onChange, onBlur, reset, setValue },
    } = useInput(validateFunction);

    const id = useId();
    const inputRef = useRef();

    useImperativeHandle(ref, () => ({
      value,
      isValid,
      isInValid,
      reset,
      focus() {
        inputRef.current.focus();
      },
      setValue,
    }));

    return (
      <div className={`w-${width ?? '11/12'} h-max `}>
        <div
          className={`w-full h-max flex  rounded-md bg-slate-200 px-2 py-1 gap-x-1`}
        >
          <div className="flex gap-x-2 basis-1/3 max-w-1/2 items-center">
            {icon}
            <label htmlFor={id} className="text-[14px] text-slate-600">
              {title}
            </label>
          </div>
          <input
            ref={inputRef}
            value={value}
            onBlur={onBlur}
            onChange={onChange}
            readOnly={readOnly}
            className="bg-transparent basis-3/4  w-max outline-none text-primary py-1 border-b-2 border-transparent focus:border-slate-400 duration-300"
            id={id}
            type={type ?? 'text'}
            placeholder={placeholder}
          />
        </div>
        <ErrorMessage isShow={isInValid} message={errorText} />
      </div>
    );
  },
);

export const TextAreaInformation = forwardRef(
  (
    { icon, title, placeholder, width, rows, readOnly, validateFunction },
    ref,
  ) => {
    const {
      state: { value, isValid, isInValid },
      actions: { onChange, onBlur, reset, setValue },
    } = useInput(validateFunction);

    const id = useId();

    useImperativeHandle(ref, () => ({
      value,
      isValid,
      isInValid,
      reset,
      setValue,
    }));

    return (
      <div
        className={`w-${
          width ?? '11/12'
        } h-max flex  rounded-md bg-slate-200 px-2 py-1 gap-x-1`}
      >
        <div className="flex gap-x-2 basis-1/3 max-w-1/2 items-center">
          {icon}
          <label htmlFor={id} className="text-[14px] text-slate-600">
            {title}
          </label>
        </div>
        <textarea
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          readOnly={readOnly}
          rows={rows}
          className="resize-none bg-transparent basis-3/4  w-max outline-none text-primary py-1 border-b-2 border-transparent focus:border-slate-400 duration-300"
          id={id}
          placeholder={placeholder}
        />
      </div>
    );
  },
);

export const RadioInputInformation = forwardRef(
  ({ list, title, icon, readOnly }, ref) => {
    const { value, onChange, setValue } = useRadioInput(list[0].value);

    useImperativeHandle(ref, () => ({
      value,
      setValue,
    }));

    return (
      <div className="flex flex-col w-11/12 px-2 py-1 bg-slate-200 rounded-md">
        <div className="flex items-center gap-x-2 text-[14px] text-slate-600">
          {icon}
          <h4>{title}</h4>
        </div>
        <div className="flex items-center gap-x-2 justify-end">
          {list.map((item) => {
            return (
              <div key={item.title} className="flex items-center gap-x-2">
                <label className="text-primary" htmlFor={item.title}>
                  {item.title}
                </label>
                <input
                  checked={value === item.value}
                  onChange={onChange}
                  value={item.value}
                  type="radio"
                  id={item.title}
                  disabled={readOnly}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);
