import { theme } from "../const"
import { CoreSuper } from "./super"

type ThemeTypes = Exclude<CoreSuper['_argv']['theme'], undefined>

const prompts: Record< Exclude<ThemeTypes, 'custom'>, {
	system : string,
	// eslint-disable-next-line @stylistic/no-multi-spaces
	user   : string 
}> = {
	[theme.docs] : {
		system : `You are a helpful assistant explaining how to use the provided code library and provide detailed documentation.\nThe content for the following code library:\n\n{{content}}`,
		user   : `Generate a complete and user-oriented README in Markdown format for the provided code library. 
      Assume the documentation will be viewed by end-users who seek a clear understanding of how to install, configure, and use the library effectively. 
      If a package.json file is provided, extract relevant information such as project name, description, installation steps, available binaries, author(s), contributor(s), license, exports, and dependencies, integrating these details seamlessly into the documentation. 
      Include examples and details for each aspect of the library, aiming to cover both beginners and advanced users.
      
      structure:
      
      # Project Title
      > A concise project description explaining the library's purpose and main features.
      
      ## Table of Contents
      - Overview
      - Installation
      - Usage
        - Setup & Configuration
        - API Reference
        - Code Examples
      - Additional Information
        - Author & Contributors
        - Contributing
        - License
      
      ## Overview
      Provide a high-level explanation of the library's functionality, its key advantages, and core use cases.
      
      ## Installation
      Explain installation in detail:
      1. List prerequisites, if any.
      2. Provide step-by-step installation instructions using npm/yarn or other methods, based on package.json information.
      
      ## Usage
      ### Setup & Configuration
      Outline any configuration steps required post-installation, using examples if needed.
      
      ### API Reference
      Document all exposed functions, classes, or modules:
      - **Function/Class Name**: Describe its purpose and main use.
      - **Parameters**: Detail expected parameters with types and optional/default values.
      - **Return Value**: Describe the return type and any specific details.
      - **Examples**: Provide clear, context-rich examples.
      
      ### Code Examples
      Include multiple examples showcasing the library in action, covering different scenarios.
      
      ## Additional Information
      ### Author
      List the main author as found in package.json.
      
      ### Contributors
      Provide a contributors list, if available.
      
      ### Contributing
      Explain how to contribute, with links to contributing guidelines if they exist.
      
      ### License
      Detail the license information as specified in package.json.
      
      ---
      
      The output should be written in strict Markdown format and provide a comprehensive, user-friendly guide.`,
	},
	[theme.fix] : {
		system : `You are a helpful assistant explaining how to identify and fix issues in the provided code library.\nThe content for the following code library:\n\n{{content}}`,
		user   : `Analyze the provided code library and generate a detailed report in Markdown format on common issues and their solutions. 
    If a package.json file is provided, extract relevant information such as project name, description, and installation steps, integrating these details seamlessly into the report. 
    Include examples and details for each aspect of the library, aiming to cover both simple and complex issues.
    
    structure:
    
    # Project Title
    > A concise project description explaining the library's purpose and main features.
    
    ## Table of Contents
    - Overview of Common Issues
    - Solutions
    - Additional Information
    
    ## Overview of Common Issues
    Provide a summary of typical problems encountered when using the library.
    
    ## Solutions
    Outline solutions to each identified issue, with step-by-step instructions and code examples.
    
    ## Additional Information
    ### Author
    List the main author as found in package.json.
    
    ### Contributors
    Provide a contributors list, if available.
    
    ### License
    Detail the license information as specified in package.json.
    
    ---
    
    The output should be written in strict Markdown format and provide a comprehensive guide to troubleshooting the library.`,
	},
	[theme.performance] : {
		system : `You are a helpful assistant explaining how to optimize the performance of the provided code library.\nThe content for the following code library:\n\n{{content}}`,
		user   : `Generate a comprehensive guide in Markdown format on optimizing the performance of the provided code library. 
    Assume the audience consists of developers looking to enhance their application's performance.
    
    structure:
    
    # Project Title
    > A concise project description explaining the library's purpose and main features.
    
    ## Table of Contents
    - Overview of Performance
    - Optimization Techniques
    - Performance Testing
    - Additional Information
    
    ## Overview of Performance
    Discuss the importance of performance in software development and provide an overview of the library's performance metrics.
    
    ## Optimization Techniques
    Provide detailed instructions on various optimization techniques that can be applied to the library, along with examples.
    
    ## Performance Testing
    Explain how to test the performance of the library, including tools and methods.
    
    ## Additional Information
    ### Author
    List the main author as found in package.json.
    
    ### Contributors
    Provide a contributors list, if available.
    
    ### License
    Detail the license information as specified in package.json.
    
    ---
    
    The output should be written in strict Markdown format and provide a comprehensive guide to performance optimization.`,
	},
	[theme.refactor] : {
		system : `You are a helpful assistant explaining how to refactor code for the provided code library.\nThe content for the following code library:\n\n{{content}}`,
		user   : `Generate a detailed guide in Markdown format on how to refactor the provided code library. 
    Include best practices and principles for writing clean, maintainable code. 
    
    structure:
    
    # Project Title
    > A concise project description explaining the library's purpose and main features.
    
    ## Table of Contents
    - Overview of Refactoring
    - Refactoring Techniques
    - Example Refactorings
    - Additional Information
    
    ## Overview of Refactoring
    Discuss what refactoring is and its importance in software development.
    
    ## Refactoring Techniques
    Describe common refactoring techniques, providing examples for each.
    
    ## Example Refactorings
    Provide concrete examples of code refactorings applied to the library, with before and after comparisons.
    
    ## Additional Information
    ### Author
    List the main author as found in package.json.
    
    ### Contributors
    Provide a contributors list, if available.
    
    ### License
    Detail the license information as specified in package.json.
    
    ---
    
    The output should be written in strict Markdown format and provide a comprehensive guide to code refactoring.`,
	},
	[theme.explain] : {
		system : `You are a helpful assistant providing explanations for the provided code library.\nThe content for the following code library:\n\n{{content}}`,
		user   : `Create a detailed explanation in Markdown format for the provided code library, focusing on its design, structure, and functionality. 
    Include examples to illustrate key concepts and usage.
    
    structure:
    
    # Project Title
    > A concise project description explaining the library's purpose and main features.
    
    ## Table of Contents
    - Overview of the Code Library
    - Key Components
    - Detailed Explanations
    - Additional Information
    
    ## Overview of the Code Library
    Provide an overview of the library, including its main features and intended use cases.
    
    ## Key Components
    Describe the key components of the library, explaining their roles and how they interact.
    
    ## Detailed Explanations
    Provide detailed explanations of important concepts, including code snippets to clarify usage.
    
    ## Additional Information
    ### Author
    List the main author as found in package.json.
    
    ### Contributors
    Provide a contributors list, if available.
    
    ### License
    Detail the license information as specified in package.json.
    
    ---
    
    The output should be written in strict Markdown format and provide a comprehensive guide to understanding the library.`,
	},
	[theme.test] : {
		system : `You are a helpful assistant guiding users on testing the provided code library.\nThe content for the following code library:\n\n{{content}}`,
		user   : `Develop a detailed guide in Markdown format on testing the provided code library. 
    Assume the audience consists of developers who want to ensure their code is well-tested.
    
    structure:
    
    # Project Title
    > A concise project description explaining the library's purpose and main features.
    
    ## Table of Contents
    - Overview of Testing
    - Testing Frameworks and Tools
    - Test Cases and Examples
    - Additional Information
    
    ## Overview of Testing
    Discuss the importance of testing in software development and provide an overview of the library's testing approach.
    
    ## Testing Frameworks and Tools
    Describe the testing frameworks and tools available for use with the library, providing examples of how to set them up.
    
    ## Test Cases and Examples
    Provide examples of test cases, including unit tests and integration tests, demonstrating how to write and run tests.
    
    ## Additional Information
    ### Author
    List the main author as found in package.json.
    
    ### Contributors
    Provide a contributors list, if available.
    
    ### License
    Detail the license information as specified in package.json.
    
    ---
    
    The output should be written in strict Markdown format and provide a comprehensive guide to testing the library.`,
	},
}

export default prompts
