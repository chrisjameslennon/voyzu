# Input decimal precision

Use decimalPlaces={2} for fixed two-decimal display and at most two fractional digits while typing or pasting. This is optional; inputs without it retain native behavior.

The control renders type="text" with inputMode="decimal". Numeric values display with trailing zeros initially and on blur; empty values stay blank. While focused it preserves intermediate text such as 12. or 0. Text with excess decimal places is rejected, not silently truncated. Set min={0} to prevent entering a minus sign. Other min/max constraints still need form and server validation.

onChange is a standard input event whose target.value is the editing string. Do not use valueAsNumber: text inputs return NaN. Store the string while editing, or convert with Number(value), treating an empty value separately. Validate numeric precision again on the server.

Example: <Input decimalPlaces={2} min={0} value={amount} onChange={(event) => setAmount(event.target.value)} />
