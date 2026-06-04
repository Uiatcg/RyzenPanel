--[[
	Ryzen AI Bridge — Roblox Studio <-> Local AI Server
	Place this script in a Plugin script in Roblox Studio.
]]

local SERVER_URL = "http://127.0.0.1:8765"

local toolbar = plugin:CreateToolbar("Ryzen AI")
local toggleBtn = toolbar:CreateButton("AI Bridge", "Open the AI Bridge panel", "rbxassetid://4483345919")

local dockWidgetInfo = DockWidgetPluginGuiInfo.new(
	Enum.InitialDockState.Floating,
	false, false, 480, 600, 480, 600
)
local widget = plugin:CreateDockWidgetPluginGui("RyzenAIBridge", dockWidgetInfo)
widget.Title = "Ryzen AI Bridge"

-- Build UI
local frame = Instance.new("ScrollingFrame")
frame.Size = UDim2.new(1, 0, 1, 0)
frame.Position = UDim2.new(0, 0, 0, 0)
frame.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
frame.BorderSizePixel = 0
frame.CanvasSize = UDim2.new(0, 0, 0, 0)
frame.AutomaticCanvasSize = Enum.AutomaticSize.Y
frame.ScrollBarThickness = 8
frame.Parent = widget

local function makeLabel(text, size, color)
	local lbl = Instance.new("TextLabel")
	lbl.Size = UDim2.new(1, -20, 0, size or 30)
	lbl.Position = UDim2.new(0, 10, 0, 0)
	lbl.BackgroundTransparency = 1
	lbl.Text = text
	lbl.TextColor3 = color or Color3.fromRGB(220, 220, 220)
	lbl.TextXAlignment = Enum.TextXAlignment.Left
	lbl.Font = Enum.Font.SourceSans
	lbl.TextSize = 16
	lbl.BorderSizePixel = 0
	return lbl
end

local function makeButton(text, yPos, callback)
	local btn = Instance.new("TextButton")
	btn.Size = UDim2.new(1, -20, 0, 36)
	btn.Position = UDim2.new(0, 10, 0, yPos)
	btn.BackgroundColor3 = Color3.fromRGB(50, 120, 200)
	btn.Text = text
	btn.TextColor3 = Color3.fromRGB(255, 255, 255)
	btn.Font = Enum.Font.SourceSansBold
	btn.TextSize = 18
	btn.BorderSizePixel = 0
	btn.Parent = frame
	btn.MouseButton1Click:Connect(callback)
	return btn
end

local y = 10
local title = makeLabel("Ryzen AI Bridge", 40, Color3.fromRGB(80, 200, 255))
title.TextSize = 24
title.TextXAlignment = Enum.TextXAlignment.Center
title.Position = UDim2.new(0, 0, 0, y)
title.Size = UDim2.new(1, 0, 0, 40)
title.Parent = frame

y = y + 50
local promptLabel = makeLabel("What do you want to create?", 24, Color3.fromRGB(200, 200, 200))
promptLabel.Position = UDim2.new(0, 10, 0, y)
promptLabel.Parent = frame

y = y + 30
local inputBox = Instance.new("TextBox")
inputBox.Size = UDim2.new(1, -20, 0, 120)
inputBox.Position = UDim2.new(0, 10, 0, y)
inputBox.BackgroundColor3 = Color3.fromRGB(20, 20, 20)
inputBox.TextColor3 = Color3.fromRGB(255, 255, 255)
inputBox.BorderSizePixel = 0
inputBox.Font = Enum.Font.Code
inputBox.TextSize = 14
inputBox.Text = ""
inputBox.ClearTextOnFocus = false
inputBox.MultiLine = true
inputBox.TextXAlignment = Enum.TextXAlignment.Left
inputBox.TextYAlignment = Enum.TextYAlignment.Top
inputBox.PlaceholderText = "e.g. Create a part named 'Sword' with a red brick material"
inputBox.Parent = frame

y = y + 130
local modeLabel = makeLabel("Output type:", 24)
modeLabel.Position = UDim2.new(0, 10, 0, y)
modeLabel.Parent = frame

y = y + 28
local modeDropdown = Instance.new("TextButton")
modeDropdown.Size = UDim2.new(1, -20, 0, 32)
modeDropdown.Position = UDim2.new(0, 10, 0, y)
modeDropdown.BackgroundColor3 = Color3.fromRGB(40, 40, 40)
modeDropdown.Text = "Script (Server)"
modeDropdown.TextColor3 = Color3.fromRGB(255, 255, 255)
modeDropdown.Font = Enum.Font.SourceSans
modeDropdown.TextSize = 16
modeDropdown.BorderSizePixel = 0
modeDropdown.Parent = frame

local modes = {"Script (Server)", "LocalScript", "ModuleScript", "Insert Instance"}
local modeIndex = 1
modeDropdown.MouseButton1Click:Connect(function()
	modeIndex = modeIndex % #modes + 1
	modeDropdown.Text = modes[modeIndex]
end)

y = y + 42
local statusLabel = makeLabel("Ready", 20, Color3.fromRGB(150, 255, 150))
statusLabel.Position = UDim2.new(0, 10, 0, y)
statusLabel.Parent = frame

y = y + 30
local generateBtn = makeButton("Generate & Insert", y, function()
	local prompt = inputBox.Text
	if #prompt == 0 then
		statusLabel.Text = "Please enter a prompt"
		statusLabel.TextColor3 = Color3.fromRGB(255, 150, 150)
		return
	end

	statusLabel.Text = "Sending to AI..."
	statusLabel.TextColor3 = Color3.fromRGB(255, 200, 100)

	local success, result = pcall(function()
		local httpService = game:GetService("HttpService")
		local data = httpService:JSONEncode({
			prompt = prompt,
			type = modes[modeIndex]
		})
		local response = httpService:PostAsync(SERVER_URL, data, Enum.HttpContentType.ApplicationJson, false)
		return httpService:JSONDecode(response)
	end)

	if success and result.success then
		statusLabel.Text = "Generated!"
		statusLabel.TextColor3 = Color3.fromRGB(150, 255, 150)

		if modes[modeIndex] == "Insert Instance" then
			-- Insert generated instances into the game
			insertInstance(result.code)
		else
			-- Insert a script with the generated code
			insertScript(result.code, modes[modeIndex])
		end
	else
		statusLabel.Text = "Error: " .. (result and result.error or "Connection failed")
		statusLabel.TextColor3 = Color3.fromRGB(255, 150, 150)
	end
end)

y = y + 50
local function makeInsertButton(text, yOff, cb)
	local btn = Instance.new("TextButton")
	btn.Size = UDim2.new(0.5, -15, 0, 36)
	btn.Position = UDim2.new(0, 10, 0, yOff)
	btn.BackgroundColor3 = Color3.fromRGB(60, 60, 60)
	btn.Text = text
	btn.TextColor3 = Color3.fromRGB(255, 255, 255)
	btn.Font = Enum.Font.SourceSans
	btn.TextSize = 16
	btn.BorderSizePixel = 0
	btn.Parent = frame
	btn.MouseButton1Click:Connect(cb)
	return btn
end

y = y + 50
local clearBtn = makeInsertButton("Clear", y, function()
	inputBox.Text = ""
	statusLabel.Text = "Cleared"
	statusLabel.TextColor3 = Color3.fromRGB(150, 200, 255)
end)
clearBtn.Size = UDim2.new(0.5, -15, 0, 36)
clearBtn.Position = UDim2.new(0, 10, 0, y)

local settingsBtn = makeInsertButton("Server Settings", y, function()
	showSettingsDialog()
end)
settingsBtn.Size = UDim2.new(0.5, -15, 0, 36)
settingsBtn.Position = UDim2.new(0.5, 5, 0, y)

function insertScript(code, scriptType)
	local container = Instance.new("Script")
	if scriptType:find("LocalScript") then
		container = Instance.new("LocalScript")
	elseif scriptType:find("ModuleScript") then
		container = Instance.new("ModuleScript")
	end
	container.Source = code
	container.Name = "RyzenGenerated"
	container.Parent = game.Workspace
	selection:Set({container})
end

function insertInstance(instanceCode)
	local func, err = loadstring(instanceCode)
	if func then
		local success, result = pcall(func)
		if success then
			if typeof(result) == "Instance" then
				result.Parent = game.Workspace
				selection:Set({result})
			end
		else
			statusLabel.Text = "Instance error: " .. tostring(result)
			statusLabel.TextColor3 = Color3.fromRGB(255, 150, 150)
		end
	else
		statusLabel.Text = "Lua error: " .. tostring(err)
		statusLabel.TextColor3 = Color3.fromRGB(255, 150, 150)
	end
end

function showSettingsDialog()
	local dlg = Instance.new("ScreenGui")
	dlg.Name = "SettingsDialog"
	dlg.Parent = widget

	local bg = Instance.new("Frame")
	bg.Size = UDim2.new(1, 0, 1, 0)
	bg.BackgroundColor3 = Color3.fromRGB(0, 0, 0)
	bg.BackgroundTransparency = 0.5
	bg.Parent = dlg

	local box = Instance.new("Frame")
	box.Size = UDim2.new(0, 360, 0, 200)
	box.Position = UDim2.new(0.5, -180, 0.5, -100)
	box.BackgroundColor3 = Color3.fromRGB(40, 40, 40)
	box.BorderSizePixel = 0
	box.Parent = dlg

	local lbl = Instance.new("TextLabel")
	lbl.Size = UDim2.new(1, -20, 0, 30)
	lbl.Position = UDim2.new(0, 10, 0, 10)
	lbl.BackgroundTransparency = 1
	lbl.Text = "Server URL"
	lbl.TextColor3 = Color3.fromRGB(220, 220, 220)
	lbl.Font = Enum.Font.SourceSans
	lbl.TextSize = 18
	lbl.TextXAlignment = Enum.TextXAlignment.Left
	lbl.Parent = box

	local urlBox = Instance.new("TextBox")
	urlBox.Size = UDim2.new(1, -20, 0, 36)
	urlBox.Position = UDim2.new(0, 10, 0, 45)
	urlBox.BackgroundColor3 = Color3.fromRGB(20, 20, 20)
	urlBox.TextColor3 = Color3.fromRGB(255, 255, 255)
	urlBox.BorderSizePixel = 0
	urlBox.Font = Enum.Font.Code
	urlBox.TextSize = 14
	urlBox.Text = SERVER_URL
	urlBox.Parent = box

	local saveBtn = Instance.new("TextButton")
	saveBtn.Size = UDim2.new(0.5, -15, 0, 36)
	saveBtn.Position = UDim2.new(0, 10, 0, 95)
	saveBtn.BackgroundColor3 = Color3.fromRGB(50, 120, 200)
	saveBtn.Text = "Save"
	saveBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
	saveBtn.Font = Enum.Font.SourceSansBold
	saveBtn.TextSize = 18
	saveBtn.BorderSizePixel = 0
	saveBtn.Parent = box
	saveBtn.MouseButton1Click:Connect(function()
		SERVER_URL = urlBox.Text
		dlg:Destroy()
		statusLabel.Text = "Server URL updated"
		statusLabel.TextColor3 = Color3.fromRGB(150, 200, 255)
	end)

	local closeBtn = Instance.new("TextButton")
	closeBtn.Size = UDim2.new(0.5, -15, 0, 36)
	closeBtn.Position = UDim2.new(0.5, 5, 0, 95)
	closeBtn.BackgroundColor3 = Color3.fromRGB(80, 80, 80)
	closeBtn.Text = "Cancel"
	closeBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
	closeBtn.Font = Enum.Font.SourceSans
	closeBtn.TextSize = 18
	closeBtn.BorderSizePixel = 0
	closeBtn.Parent = box
	closeBtn.MouseButton1Click:Connect(function()
		dlg:Destroy()
	end)
end

toggleBtn.Click:Connect(function()
	widget.Enabled = not widget.Enabled
end)

widget.Enabled = true
