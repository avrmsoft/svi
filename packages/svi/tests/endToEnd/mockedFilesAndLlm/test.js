module.exports = `Test prompt
`
    );

    fakeFs.applyMocks();

    enableFakeLLMProcessor({ apiKey: "testKey" });

    await runCli([
      "node",
      "svi",
      "run",
      "-m",
      "gemini-2.5-flash",
      "-k",
      "testKey",
    ]);

    expect(fakeFs.fileExists("test.js")).toBe(true);

    const content = fakeFs.fileContent("test.js");

    expect(content).toContain("Test prompt");
    expect(content).toContain("Please return only the code");
    expect(content).toContain("without any explanations");
    expect(content).toContain("installation manual");
    expect(content).toContain(
      "The code should fulfill the following requirements"
    );
  });
});

Additional context:`;