import { useId, type ReactNode } from "react";

export function Slider(props: { value: number; min: number; max: number; step?: number; onChange: (v: number) => void; label: string; format?: (v: number) => string; className?: string }) {
  const { value, min, max, step = 1, onChange, label, format, className } = props;
  const pct = ((value - min) / (max - min)) * 100;
  const id = useId();
  return (
    <div className={`pop-section ${className ?? ""}`}>
      <div className="row spread">
        <label className="label" htmlFor={id}>
          {label}
        </label>
        <span className="value">{format ? format(value) : value}</span>
      </div>
      <input
        id={id}
        className="slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ ["--fill" as string]: `${pct}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export function Seg<T extends string>(props: { value: T; options: { value: T; label: ReactNode; title?: string }[]; onChange: (v: T) => void; label?: string }) {
  return (
    <div className="seg" role="group" aria-label={props.label}>
      {props.options.map((o) => (
        <button key={o.value} type="button" aria-pressed={o.value === props.value} title={o.title} onClick={() => props.onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Switch(props: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return <button type="button" role="switch" className="switch" aria-checked={props.checked} aria-label={props.label} onClick={() => props.onChange(!props.checked)} />;
}

export function Swatches(props: { colors: string[]; value: string | null; onPick: (c: string) => void; allowNone?: boolean; custom?: boolean; noneLabel?: string; customLabel?: string }) {
  return (
    <div className="swatches">
      {props.allowNone && <button type="button" className="swatch none" title={props.noneLabel} aria-label={props.noneLabel} aria-pressed={props.value === null} onClick={() => props.onPick("none")} />}
      {props.colors.map((c) => (
        <button key={c} type="button" className="swatch" style={{ background: c }} title={c} aria-label={c} aria-pressed={props.value?.toUpperCase() === c.toUpperCase()} onClick={() => props.onPick(c)} />
      ))}
      {props.custom && (
        <label className="swatch custom" title={props.customLabel}>
          <input type="color" aria-label={props.customLabel} value={props.value && /^#[0-9a-f]{6}$/i.test(props.value) ? props.value : "#ff5a36"} onChange={(e) => props.onPick(e.target.value.toUpperCase())} />
        </label>
      )}
    </div>
  );
}
