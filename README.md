# 🌐 Spanner GUI SQL Client

🚀 A simple and user-friendly GUI client for Google Cloud Spanner, built with Next.js and React.

## 🌟 Features

- 🔍 Easy navigation of Spanner instances and databases
- ⚡ Execute SQL queries
- 📊 View query results in a clean, tabular format
- 📜 Query history for quick access to past operations
- 🎨 Syntax highlighting and query formatting
- 📱 Responsive design for desktop and mobile use

## 📦 Installation

```bash
git clone https://github.com/esh2n/spanner-gui.git
cd spanner-gui
bun install
bun run dev.tauri
```

## 🚀 Quick Start

### 1. Set up Google Cloud credentials

Ensure you have set up your Google Cloud credentials. You can do this by setting the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to point to your service account key file.

```shellscript
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-key.json"
```

### 2. Run the development server

```shellscript
bun run dev.tauri
```

## 🖥 Usage

1. Enter your Google Cloud Project ID and click "Initialize"
2. Select a Spanner instance from the dropdown
3. Choose a database from the selected instance
4. Write your SQL query in the editor
5. Click "Execute" to run the query
6. View results in the table below
7. Access query history in the "History" tab


## 🛠 API Reference

### POST /api/spanner

Handles all Spanner-related operations.

#### Request Body

```typescript
{
  type: 'instances' | 'databases' | 'query',
  projectId: string,
  instanceId?: string,
  databaseId?: string,
  query?: string
}
```

#### Response

- For `instances`: Array of instance names
- For `databases`: Array of database names
- For `query`: Array of result rows


## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. 🍴 Fork the repository
2. 🌿 Create your feature branch: `git checkout -b my-new-feature`
3. 💾 Commit your changes: `git commit -am 'Add some feature'`
4. 🚀 Push to the branch: `git push origin my-new-feature`
5. 🎉 Submit a pull request


## 📝 TODO

- 🔒 Implement user authentication
- 📊 Add visual query plan explanation
- 🔄 Support for DML operations (INSERT, UPDATE, DELETE)
- 📈 Query performance metrics
- 🌓 Dark mode support
- 🧪 Comprehensive unit and integration testing


## 📜 License

MIT

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tauri](https://tauri.app/)
- [Google Cloud Spanner](https://cloud.google.com/spanner)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)