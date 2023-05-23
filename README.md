# Cricor Capsule
Welcome to your Cricor Capsule! The basic model generated by this template allows searching for Player concepts.

The next steps you should take are:

1. Do a sanity check on the generated capsule and make refinements if needed.

2. Update training examples.

3. Prepare your capsule for release into Bixby MarketPlace.

# Try it out
Your first step should be to try out the capsule. Go to the training tab and run the training that is added to your capsule by default. Examine the models, dialogs and the plans generated. This will give you and idea of changes you might want to make next.

# Is this the right model for you?
Make sure you have the right model to support your use cases and add training examples to support those use cases.
You may want to update your CSV files regenerate the model from the template if you find out issues with the generated
model early on that can be fixed by tweaking the data (e.g. by renaming a column so that it's type can be correctly
inferred or by changing the filtering requirements of a column by adding annotation) - TBD: link to docs

There are obviously limitations to the capsules that can be generated from the template and you might need to do further
tweaks by directly modifying the capsule files.

# Tweak dialogs and views
You can edit dialog statements in the `resources/en/dialog/` folder. This could let you customize dialog to give your capsule a more specific branding or personality. [Dialog](https://bixbydevelopers.com/dev/docs/dev-guide/developers/creating-ui.refining-dialog) you write should match our [Writing Dialog Design Guide](https://bixbydevelopers.com/dev/docs/dev-guide/design-guides/writing).

Views are stored in `resources/base/views/`. If you'd like to [update the existing views](https://bixbydevelopers.com/dev/docs/dev-guide/developers/creating-ui.building-views), read the [Designing Your Capsule guide](https://bixbydevelopers.com/dev/docs/dev-guide/design-guides/service).

# Update training examples
You need to go over all use cases you want to support and make sure you have sufficient training to cover them. Read the sub sections below for some ideas on the training examples you need for your use cases.


## Player
### General search
Template adds the following training example by default:

`[g:Player] Show all players`

You need to review all generated training examples and remove or update them if they do not represent a correct use case in your capsule or are not a natural way for users to ask for that use case.
You can then compile and try out this training example to see how it works. Also examine all the dialogs and views generated for the example and update them as needed.


# Preparing capsule for release into Bixby MarketPlace
Refer to our documentation on final steps you need to take to release the capsule to marketplace [here](https://bixbydevelopers.com/dev/docs/dev-guide/developers/deploying.prep-marketplace)

# Additional Information
For more on Import and Search template refer to Bixby documentations [here](https://bixbydevelopers.com/dev/docs/sample-capsules/templates/search)
