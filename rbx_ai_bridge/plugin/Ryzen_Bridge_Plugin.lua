--[[
	Ryzen AI Bridge — Roblox Studio Plugin
	Fetches code I generate and inserts it into your game.
	Server: http://127.0.0.1:8765
]]

local SERVER_URL = "http://127.0.0.1:8765"

local toolbar = plugin:CreateToolbar("Ryzen AI")
local toggleBtn = toolbar:CreateButton("Bridge", "Open the Ryzen AI Bridge panel", "rbxassetid://4483345919")
toggleBtn:SetActive(true)

local dockInfo = DockWidgetPluginGuiInfo.new(
	Enum.InitialDockState.Floating,
	false, false, 420, 400, 420, 600
)
local widget = plugin:CreateDockWidgetPluginGui("RyzenAIBridge", dockInfo)
widget.Title = "Ryzen AI Bridge"

-- UI
local frame = Instance.new("ScrollingFrame")
frame.Size = UDim2.new(1, 0, 1, 0)
frame.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
frame.BorderSizePixel = 0
frame.CanvasSize = UDim2.new(0, 0, 0, 0)
frame.AutomaticCanvasSize = Enum.AutomaticSize.Y
frame.ScrollBarThickness = 8
frame.Parent = widget

local y = 10

local title = Instance.new("TextLabel")
title.Size = UDim2.new(1, 0, 0, 40)
title.Position = UDim2.new(0, 0, 0, y)
title.BackgroundTransparency = 1
title.Text = "Ryzen AI Bridge"
title.TextColor3 = Color3.fromRGB(80, 200, 255)
title.Font = Enum.Font.SourceSansBold
title.TextSize = 22
title.TextXAlignment = Enum.TextXAlignment.Center
title.Parent = frame

y = y + 50

local statusLabel = Instance.new("TextLabel")
statusLabel.Size = UDim2.new(1, -20, 0, 24)
statusLabel.Position = UDim2.new(0, 10, 0, y)
statusLabel.BackgroundTransparency = 1
statusLabel.Text = "Ready — waiting for code from AI..."
statusLabel.TextColor3 = Color3.fromRGB(180, 180, 180)
statusLabel.Font = Enum.Font.SourceSans
statusLabel.TextSize = 15
statusLabel.TextXAlignment = Enum.TextXAlignment.Center
statusLabel.Parent = frame

y = y + 35

local scriptTypeLabel = Instance.new("TextLabel")
scriptTypeLabel.Size = UDim2.new(1, -20, 0, 22)
scriptTypeLabel.Position = UDim2.new(0, 10, 0, y)
scriptTypeLabel.BackgroundTransparency = 1
scriptTypeLabel.Text = "Insert as:"
scriptTypeLabel.TextColor3 = Color3.fromRGB(200, 200, 200)
scriptTypeLabel.Font = Enum.Font.SourceSans
scriptTypeLabel.TextSize = 16
scriptTypeLabel.TextXAlignment = Enum.TextXAlignment.Left
scriptTypeLabel.Parent = frame

y = y + 26

local typeCycle = Instance.new("TextButton")
typeCycle.Size = UDim2.new(1, -20, 0, 32)
typeCycle.Position = UDim2.new(0, 10, 0, y)
typeCycle.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
typeCycle.Text = "Script"
typeCycle.TextColor3 = Color3.fromRGB(255, 255, 255)
typeCycle.Font = Enum.Font.SourceSans
typeCycle.TextSize = 16
typeCycle.BorderSizePixel = 0
typeCycle.Parent = frame

local types = {"Script", "LocalScript", "ModuleScript"}
local typeIndex = 1
typeCycle.MouseButton1Click:Connect(function()
	typeIndex = typeIndex % #types + 1
	typeCycle.Text = types[typeIndex]
end)

y = y + 42

local codePreviewLabel = Instance.new("TextLabel")
codePreviewLabel.Size = UDim2.new(1, -20, 0, 20)
codePreviewLabel.Position = UDim2.new(0, 10, 0, y)
codePreviewLabel.BackgroundTransparency = 1
codePreviewLabel.Text = "Preview:"
codePreviewLabel.TextColor3 = Color3.fromRGB(200, 200, 200)
codePreviewLabel.Font = Enum.Font.SourceSans
codePreviewLabel.TextSize = 14
codePreviewLabel.TextXAlignment = Enum.TextXAlignment.Left
codePreviewLabel.Parent = frame

y = y + 22

local previewBox = Instance.new("TextBox")
previewBox.Size = UDim2.new(1, -20, 0, 80)
previewBox.Position = UDim2.new(0, 10, 0, y)
previewBox.BackgroundColor3 = Color3.fromRGB(20, 20, 20)
previewBox.TextColor3 = Color3.fromRGB(200, 200, 200)
previewBox.BorderSizePixel = 0
previewBox.Font = Enum.Font.Code
previewBox.TextSize = 12
previewBox.Text = "(click Fetch to see latest code)"
previewBox.ClearTextOnFocus = false
previewBox.MultiLine = true
previewBox.TextXAlignment = Enum.TextXAlignment.Left
previewBox.TextYAlignment = Enum.TextYAlignment.Top
previewBox.Parent = frame

y = y + 90

local btnY = y

local getBtn = Instance.new("TextButton")
getBtn.Size = UDim2.new(1, -20, 0, 40)
getBtn.Position = UDim2.new(0, 10, 0, btnY)
getBtn.BackgroundColor3 = Color3.fromRGB(50, 120, 200)
getBtn.Text = "Get Code from AI"
getBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
getBtn.Font = Enum.Font.SourceSansBold
getBtn.TextSize = 18
getBtn.BorderSizePixel = 0
getBtn.Parent = frame

btnY = btnY + 50

local insertBtn = Instance.new("TextButton")
insertBtn.Size = UDim2.new(1, -20, 0, 40)
insertBtn.Position = UDim2.new(0, 10, 0, btnY)
insertBtn.BackgroundColor3 = Color3.fromRGB(80, 160, 80)
insertBtn.Text = "Insert into Game"
insertBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
insertBtn.Font = Enum.Font.SourceSansBold
insertBtn.TextSize = 18
insertBtn.BorderSizePixel = 0
insertBtn.Parent = frame

btnY = btnY + 50

local fetchAndInsertBtn = Instance.new("TextButton")
fetchAndInsertBtn.Size = UDim2.new(1, -20, 0, 40)
fetchAndInsertBtn.Position = UDim2.new(0, 10, 0, btnY)
fetchAndInsertBtn.BackgroundColor3 = Color3.fromRGB(200, 130, 50)
fetchAndInsertBtn.Text = "Fetch & Insert (one click)"
fetchAndInsertBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
fetchAndInsertBtn.Font = Enum.Font.SourceSansBold
fetchAndInsertBtn.TextSize = 16
fetchAndInsertBtn.BorderSizePixel = 0
fetchAndInsertBtn.Parent = frame

btnY = btnY + 60

local explanationLabel = Instance.new("TextLabel")
explanationLabel.Size = UDim2.new(1, -20, 0, 30)
explanationLabel.Position = UDim2.new(0, 10, 0, btnY)
explanationLabel.BackgroundTransparency = 1
explanationLabel.Text = ""
explanationLabel.TextColor3 = Color3.fromRGB(180, 180, 180)
explanationLabel.Font = Enum.Font.SourceSans
explanationLabel.TextSize = 14
explanationLabel.TextWrapped = true
explanationLabel.TextXAlignment = Enum.TextXAlignment.Left
explanationLabel.Parent = frame

local fetchedCode = ""

function fetchLatest()
	statusLabel.Text = "Fetching..."
	statusLabel.TextColor3 = Color3.fromRGB(255, 200, 100)
	local success, result = pcall(function()
		local http = game:GetService("HttpService")
		local resp = http:GetAsync(SERVER_URL .. "/latest")
		return http:JSONDecode(resp)
	end)
	if success and result.success then
		fetchedCode = result.code or ""
		local expl = result.explanation or ""
		local updated = result.last_updated or ""
		previewBox.Text = string.sub(fetchedCode, 1, 500)
		if #fetchedCode > 500 then
			previewBox.Text = previewBox.Text .. "\n\n... (truncated, full code will insert correctly)"
		end
		explanationLabel.Text = expl .. (updated ~= "Never" and ("\nLast update: " .. updated) or "")
		statusLabel.Text = "Code loaded!"
		statusLabel.TextColor3 = Color3.fromRGB(150, 255, 150)
	else
		local err = result and result.error or "Connection failed"
		statusLabel.Text = "Error: " .. err
		statusLabel.TextColor3 = Color3.fromRGB(255, 150, 150)
		previewBox.Text = "Error fetching: " .. err
	end
end

function insertCode()
	if #fetchedCode == 0 then
		statusLabel.Text = "Nothing to insert — fetch code first!"
		statusLabel.TextColor3 = Color3.fromRGB(255, 200, 100)
		return
	end
	local container = Instance.new("Script")
	if typeCycle.Text == "LocalScript" then
		container = Instance.new("LocalScript")
	elseif typeCycle.Text == "ModuleScript" then
		container = Instance.new("ModuleScript")
	end
	container.Source = fetchedCode
	container.Name = "RyzenGenerated"
	container.Parent = game.Workspace
	selection:Set({container})
	statusLabel.Text = "Inserted into Workspace!"
	statusLabel.TextColor3 = Color3.fromRGB(150, 255, 150)
end

getBtn.MouseButton1Click:Connect(fetchLatest)
insertBtn.MouseButton1Click:Connect(insertCode)
fetchAndInsertBtn.MouseButton1Click:Connect(function()
	fetchLatest()
	task.wait(0.5)
	insertCode()
end)

toggleBtn.Click:Connect(function()
	widget.Enabled = not widget.Enabled
end)

widget.Enabled = true
