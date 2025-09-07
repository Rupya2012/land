export function ValidatorTable({ title, color, messages }) {
	return `
		<table class="report-table" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
			<thead>
				<tr style="background: ${color}; color: white;">
					<th style="padding: 10px; text-align: left; border: 1px solid #ddd;">${title}</th>
					<th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Message</th>
					<th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Pointer</th>
				</tr>
			</thead>
			<tbody>
				${messages.map(({ code, message, pointer }) => `
					<tr>
						<td style="padding: 10px; border: 1px solid #ddd;">
							<code>${code}</code>
						</td>
						<td style="padding: 10px; border: 1px solid #ddd;">${message}</td>
						<td style="padding: 10px; border: 1px solid #ddd;">
							<code>${pointer}</code>
						</td>
					</tr>
				`).join('')}
				${messages.length === 0 ? `
					<tr>
						<td colspan="3" style="padding: 10px; border: 1px solid #ddd;">No issues found.</td>
					</tr>
				` : ''}
			</tbody>
		</table>
	`;
}
